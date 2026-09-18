"""Verify the RDP peer against Azure's certificate, then pin its SHA-256 hash."""
import hashlib
from pathlib import Path
import socket
import ssl
import subprocess

base=Path('/opt/harborline-gateway')
# Public certificate thumbprint read through authenticated Azure Run Command.
expected='6b0fe1aaf51841167c7b49fd3ea0b7febff6ae6a'
with socket.create_connection(('10.40.1.5',3389),timeout=15) as sock:
    sock.sendall(bytes.fromhex('030000130ee000000000000100080003000000'))
    response=sock.recv(4096)
    if len(response)<19 or response[11]!=2:
        raise RuntimeError('RDP server did not negotiate TLS/NLA')
    context=ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.check_hostname=False
    context.verify_mode=ssl.CERT_NONE
    with context.wrap_socket(sock,server_hostname='HL-FRONT-01') as secure:
        certificate=secure.getpeercert(binary_form=True)
        if hashlib.sha1(certificate).hexdigest()!=expected:
            raise RuntimeError('RDP certificate does not match authenticated Azure evidence')
        fingerprint='sha256:'+':'.join(f'{b:02x}' for b in hashlib.sha256(certificate).digest())
sql="""INSERT INTO guacamole_connection_parameter(connection_id,parameter_name,parameter_value)
SELECT connection_id,'cert-fingerprints','%s' FROM guacamole_connection
WHERE connection_name='Harborline - real Entra desktop'
ON CONFLICT(connection_id,parameter_name) DO UPDATE SET parameter_value=EXCLUDED.parameter_value;""" % fingerprint
subprocess.run(['docker','compose','exec','-T','database','psql','-U','guacamole','-d','guacamole','-v','ON_ERROR_STOP=1'],input=sql,text=True,cwd=base,check=True)
print('Private RDP reachable; Azure-verified certificate pinned with SHA-256.')
print('Presenter credentials remain private on the gateway; MFA enrollment is required at first sign-in.')
