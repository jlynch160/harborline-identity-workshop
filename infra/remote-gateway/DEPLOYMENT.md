# Real Entra remote session: deployment plan

Azure infrastructure created with user approval on 18 September 2026 (UTC). Gateway initialization and live checks must pass before enabling the website connection. Signed-in Windows and Entra rehearsal requires the presenter's credentials and MFA.

## Discovered existing lab

- Azure subscription: Visual Studio Enterprise Subscription (`3226d5fa-52e1-40c0-9c74-67e984356692`).
- Existing target: `RG-HARBORLINE-LAB/hl-frontline-01`, private address `10.40.1.5`, Windows, currently deallocated when inspected.
- Alternate target: `hl-kiosk-01`, `10.40.1.4`, also deallocated. Do not reuse the domain controller.
- Subnet: `/subscriptions/3226d5fa-52e1-40c0-9c74-67e984356692/resourceGroups/rg-harborline-lab/providers/Microsoft.Network/virtualNetworks/hl-lab-vnet/subnets/lab`.
- Existing portal use does not grant gateway access. The gateway has separate presenter authentication and TOTP.

## Proposed additional resources

One Linux `Standard_D2s_v3` gateway VM in East US 2, one 32-GB standard SSD, one static public IP, one NIC and a gateway-specific NSG in the existing lab subnet. The B2 family was unavailable for this subscription; D2s_v3 passed Azure validation and creation. Only HTTPS 443 is allowed inbound by the new NSG. RDP remains on the existing private network. The existing Windows VM was started with approval. Both running VMs incur Azure charges.

Gateway: `https://harborline-demo-gateway.eastus2.cloudapp.azure.com/guacamole/`.
Resource group location is West US 3; network and VMs are East US 2. Always set the deployment location explicitly.

`main.bicep` creates only the gateway resources. Activation additionally created `AllowHttpsToWorkshopGateway` at priority 120 on `hl-lab-nsg`, allowing Internet TCP 443 only to `10.40.1.6`. The pre-existing HTTPS rule targeted the federation server at `10.40.1.10`. No public RDP or SSH rule was added. Preserve the gateway private address or update this scoped rule if the NIC is replaced.

## Preparation and deployment

1. Review and approve gateway resource creation and starting the existing Windows VM. Check current region quota, supported SKU and subscription pricing before creation.
2. Choose an available Azure DNS label; generate a recovery SSH public key outside the repository. Generate cloud-init with `prepare-cloud-init.mjs` into the ignored `.private` directory.
3. Run an ARM/Bicep validation and what-if for `main.bicep` in the lab resource group with that subnet, DNS label, public key and generated cloud-init.
4. Deploy the approved plan, then verify cloud-init completion. Passwords are generated on the gateway in root-readable files, not ARM parameters, Git or the public workshop. Default `guacadmin` credentials are replaced before the web service starts.
5. Retrieve the presenter credential privately with Azure Run Command. The user enrolls the gateway’s TOTP and enters their own Windows credentials when NLA prompts. No Windows password is stored in the connection.
6. Verify the Windows RDP certificate through an authenticated Azure VM channel, then run `activate.py` on the gateway to compare the private RDP peer and pin its SHA-256 certificate fingerprint. Do not enable `ignore-cert`, disable NLA, or weaken tenant Conditional Access. Reverify and update the pin when the Windows certificate rotates.
7. Verify TLS, gateway authentication, MFA, deny-by-default access, and frame policy. The gateway permits only itself and the exact public workshop origin as frame ancestors. Microsoft portal headers remain unchanged because Entra runs as a normal top-level page in the remote browser.
8. Set `dist/remote-config.js` to the returned HTTPS gateway URL (no credentials, query tokens or passwords) and deploy the workshop update.
9. Rehearse: log into the remote desktop, open Edge and Entra, complete MFA, navigate the intended tenant, expand fullscreen, exit fullscreen, return to a story, reopen the same session, then sign out and disconnect. Confirm the presenter does not see administrative gateway management permissions.

## Important limits

- A Windows client VM may allow only one interactive session. RDP can displace a console session; rehearse outside the device demonstration.
- Some passkey/Windows Hello and device-compliance scenarios cannot be reproduced through a remote session. Confirm the tenant permits this VM; preserve its access policies.
- Returning to the story hides the same frame. Disconnecting removes the browser view but does not automatically sign out Windows/Entra or deallocate Azure resources.
- Do not expose the database, guacd, administrative credential files or default accounts. No session recording is configured.
- The container stack is running. HTTPS returned 200 with the exact workshop frame ancestor policy, gateway login rendered, TOTP and brute-force protection loaded, and private RDP certificate verification passed. Signed-in desktop and Entra behavior still require the presenter's authentication and rehearsal.

## Sources

- https://guacamole.apache.org/doc/gug/guacamole-docker.html
- https://guacamole.apache.org/doc/gug/postgresql-auth.html
- https://guacamole.apache.org/doc/gug/totp-auth.html
- https://guacamole.apache.org/doc/gug/configuring-guacamole.html
