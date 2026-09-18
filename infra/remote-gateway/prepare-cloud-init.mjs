import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const [hostname,output]=process.argv.slice(2);
if(!hostname || !/^[a-z0-9-]+\.eastus2\.cloudapp\.azure\.com$/.test(hostname) || !output) {
  throw new Error('Usage: node prepare-cloud-init.mjs <gateway-label.eastus2.cloudapp.azure.com> <output-file>');
}
const compose=await readFile(new URL('compose.yaml',import.meta.url),'utf8');
const bootstrap=await readFile(new URL('bootstrap.sh',import.meta.url),'utf8');
const seed=await readFile(new URL('seed.py',import.meta.url),'utf8');
const caddy=`${hostname} {
  tls {
    issuer acme {
      disable_http_challenge
    }
  }
  header Content-Security-Policy "frame-ancestors 'self' https://harborline-identity-workshop.sagitta107.chatgpt.site"
  header Referrer-Policy "no-referrer"
  header X-Content-Type-Options "nosniff"
  header Strict-Transport-Security "max-age=31536000"
  redir / /guacamole/
  reverse_proxy guacamole:8080 {
    flush_interval -1
  }
}
`;
// Base64 file payloads avoid YAML/shell interpolation; they contain no secrets.
const files=[['compose.yaml',compose,'0600'],['Caddyfile',caddy,'0644'],['bootstrap.sh',bootstrap,'0700'],['seed.py',seed,'0700']];
const yaml=`#cloud-config\npackage_update: true\npackages:\n  - docker.io\n  - docker-compose-v2\n  - python3\nwrite_files:\n`+files.map(([name,text,mode])=>`  - path: /opt/harborline-gateway/${name}\n    permissions: '${mode}'\n    encoding: b64\n    content: ${Buffer.from(text).toString('base64')}\n`).join('')+`runcmd:\n  - [bash, /opt/harborline-gateway/bootstrap.sh]\n`;
await mkdir(dirname(resolve(output)),{recursive:true});
await writeFile(output,yaml,{mode:0o600});
console.log('Prepared cloud-init. Passwords are generated on the gateway at first boot and are never included in this file.');
