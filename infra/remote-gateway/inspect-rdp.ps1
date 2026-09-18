$ErrorActionPreference='Stop'
$listener=Get-CimInstance -Namespace root/cimv2/terminalservices -ClassName Win32_TSGeneralSetting -Filter "TerminalName='RDP-tcp'"
$cert=Get-ChildItem 'Cert:/LocalMachine/Remote Desktop' | Where-Object Thumbprint -eq $listener.SSLCertificateSHA1Hash
if(-not $cert){$cert=Get-ChildItem 'Cert:/LocalMachine/My' | Where-Object Thumbprint -eq $listener.SSLCertificateSHA1Hash}
if(-not $cert){throw 'Bound RDP certificate not found'}
[pscustomobject]@{hostname=$env:COMPUTERNAME;subject=$cert.Subject;thumbprint=$cert.Thumbprint;expires=$cert.NotAfter.ToString('o');certificate=[Convert]::ToBase64String($cert.RawData);nla=$listener.UserAuthenticationRequired;rdpPort=(Get-ItemProperty 'HKLM:/SYSTEM/CurrentControlSet/Control/Terminal Server/WinStations/RDP-Tcp').PortNumber} | ConvertTo-Json -Compress
