[CmdletBinding()]
param(
  [string]$ResourceGroup = "rg-quorum-demo",
  [string]$ContainerApp = "identity-agents",
  [string]$DemoGroupName = "ZZ-DEMO-AI-Replay",
  [Parameter(Mandatory)] [string]$DemoUserPrincipalName
)

$ErrorActionPreference = "Stop"

function Invoke-Graph {
  param(
    [Parameter(Mandatory)] [ValidateSet("GET", "POST", "DELETE")] [string]$Method,
    [Parameter(Mandatory)] [string]$Uri,
    [object]$Body
  )

  $request = @{
    Method = $Method
    Uri = $Uri
    Headers = $script:GraphHeaders
  }
  if ($null -ne $Body) {
    $request.ContentType = "application/json"
    $request.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
  }
  Invoke-RestMethod @request
}

$tenantId = az.cmd account show --query tenantId --output tsv
$subscriptionId = az.cmd account show --query id --output tsv
$principalId = az.cmd containerapp show `
  --name $ContainerApp `
  --resource-group $ResourceGroup `
  --query identity.principalId `
  --output tsv

if (-not $tenantId -or -not $subscriptionId -or -not $principalId) {
  throw "Azure account or Container App managed identity could not be resolved."
}

$token = az.cmd account get-access-token `
  --resource-type ms-graph `
  --query accessToken `
  --output tsv
if (-not $token) {
  throw "Microsoft Graph access token could not be acquired."
}
$script:GraphHeaders = @{ Authorization = "Bearer $token" }

$graphRoot = "https://graph.microsoft.com/v1.0"
$groupFilter = [Uri]::EscapeDataString("displayName eq '$DemoGroupName'")
$groupResult = Invoke-Graph -Method GET -Uri "$graphRoot/groups?`$filter=$groupFilter&`$select=id,displayName,securityEnabled,isAssignableToRole,membershipRule"
$group = @($groupResult.value) | Select-Object -First 1

if (-not $group) {
  $mailNickname = ($DemoGroupName -replace "[^a-zA-Z0-9]", "").ToLowerInvariant()
  $group = Invoke-Graph -Method POST -Uri "$graphRoot/groups" -Body @{
    displayName = $DemoGroupName
    description = "Isolated MajorKey workshop group for approved AI add, verify, and undo demonstrations."
    mailEnabled = $false
    mailNickname = $mailNickname
    securityEnabled = $true
    groupTypes = @()
  }
  $groupDisposition = "created"
} else {
  if (-not $group.securityEnabled -or $group.isAssignableToRole -or $group.membershipRule) {
    throw "Existing group '$DemoGroupName' is not an eligible assigned, non-role security group."
  }
  $groupDisposition = "reused"
}

$encodedUser = [Uri]::EscapeDataString($DemoUserPrincipalName)
$demoUser = Invoke-Graph -Method GET -Uri "$graphRoot/users/${encodedUser}?`$select=id,displayName,userPrincipalName,accountEnabled"
if (-not $demoUser.id) {
  throw "Demo user '$DemoUserPrincipalName' was not found."
}

$managedIdentity = Invoke-Graph -Method GET -Uri "$graphRoot/servicePrincipals/${principalId}?`$select=id,displayName,servicePrincipalType"
if (-not $managedIdentity.id) {
  throw "The Container App managed identity service principal was not found."
}

$graphFilter = [Uri]::EscapeDataString("appId eq '00000003-0000-0000-c000-000000000000'")
$graphResult = Invoke-Graph -Method GET -Uri "$graphRoot/servicePrincipals?`$filter=$graphFilter&`$select=id,appId,appRoles"
$graphServicePrincipal = @($graphResult.value) | Select-Object -First 1
$graphRole = @($graphServicePrincipal.appRoles) | Where-Object {
  $_.value -eq "GroupMember.ReadWrite.All" -and $_.isEnabled -and $_.allowedMemberTypes -contains "Application"
} | Select-Object -First 1

if (-not $graphServicePrincipal.id -or -not $graphRole.id) {
  throw "Microsoft Graph GroupMember.ReadWrite.All application role could not be resolved."
}

$assignments = Invoke-Graph -Method GET -Uri "$graphRoot/servicePrincipals/$principalId/appRoleAssignments"
$existingAssignment = @($assignments.value) | Where-Object {
  $_.resourceId -eq $graphServicePrincipal.id -and $_.appRoleId -eq $graphRole.id
} | Select-Object -First 1

if (-not $existingAssignment) {
  $existingAssignment = Invoke-Graph -Method POST -Uri "$graphRoot/servicePrincipals/$principalId/appRoleAssignments" -Body @{
    principalId = $principalId
    resourceId = $graphServicePrincipal.id
    appRoleId = $graphRole.id
  }
  $permissionDisposition = "granted"
} else {
  $permissionDisposition = "already granted"
}

$privateDirectory = Join-Path $PSScriptRoot "..\.private"
New-Item -ItemType Directory -Path $privateDirectory -Force | Out-Null
$configPath = Join-Path $privateDirectory "ai-executor-config.json"
@{
  tenantId = $tenantId
  subscriptionId = $subscriptionId
  resourceGroup = $ResourceGroup
  containerApp = $ContainerApp
  managedIdentityPrincipalId = $principalId
  allowedGroup = @{
    id = $group.id
    displayName = $group.displayName
  }
  allowedUser = @{
    id = $demoUser.id
    displayName = $demoUser.displayName
    userPrincipalName = $demoUser.userPrincipalName
  }
  graphPermission = "GroupMember.ReadWrite.All"
  provisionedAtUtc = [DateTime]::UtcNow.ToString("o")
} | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $configPath -Encoding utf8

[pscustomobject]@{
  Tenant = $tenantId
  ManagedIdentity = $managedIdentity.displayName
  DemoGroup = $group.displayName
  GroupStatus = $groupDisposition
  DemoUser = $demoUser.displayName
  Permission = "GroupMember.ReadWrite.All"
  PermissionStatus = $permissionDisposition
  Configuration = $configPath
} | Format-List
