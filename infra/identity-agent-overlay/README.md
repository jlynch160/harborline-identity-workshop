# Guarded live Entra action

This overlay extends the private Identity Agents container with a presenter-approved,
reversible Microsoft Graph demonstration. It can add one allowlisted demo user to one
allowlisted, non-role security group and restore the exact prior membership state.

The language model cannot call the write endpoint. The presenter must preview and
approve the action in the private console. The executor uses the Container App's
managed identity, verifies three consecutive Graph reads, returns a signed receipt,
and requires that receipt to undo the operation.

## Provision

Run the provisioning script as a directory administrator. The script creates or
reuses the isolated group and grants the Container App managed identity only
`GroupMember.ReadWrite.All`:

```powershell
.\scripts\provision-ai-executor.ps1 `
  -DemoUserPrincipalName "presenter-demo-user@yourtenant.onmicrosoft.com"
```

The resulting tenant and object IDs are written under `.private/`, which is excluded
from Git. Pass those values to the Container App as the `AI_EXECUTOR_*` environment
variables when deploying this overlay.

## Build

The Dockerfile layers the executor and action card over the existing private agent
image. Build it in the same Azure Container Registry, then update the Container App to
the new tag. Keep at least one replica warm for workshop reliability.
