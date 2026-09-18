"""Create gateway-only credentials on the host. No Windows/Entra passwords are stored."""
import hashlib
import json
import os
from pathlib import Path
import secrets

base = Path(__file__).resolve().parent
if (base / 'presenter-credentials.json').exists():
    raise SystemExit('Refusing to overwrite existing credentials')
def hash_pair(password):
    salt = secrets.token_bytes(32)
    # Guacamole JDBC appends the uppercase hex salt to the UTF-8 password.
    digest = hashlib.sha256((password + salt.hex().upper()).encode('utf-8')).hexdigest()
    return digest, salt.hex()

admin_password = secrets.token_urlsafe(32)
presenter_password = secrets.token_urlsafe(32)
admin_hash, admin_salt = hash_pair(admin_password)
presenter_hash, presenter_salt = hash_pair(presenter_password)
database_password = secrets.token_urlsafe(40)
(base / '.env').write_text('DB_PASSWORD=' + database_password + '\n')
sql = f"""
BEGIN;
UPDATE guacamole_user SET password_hash=decode('{admin_hash}','hex'), password_salt=decode('{admin_salt}','hex'), password_date=CURRENT_TIMESTAMP WHERE entity_id=(SELECT entity_id FROM guacamole_entity WHERE name='guacadmin' AND type='USER');
UPDATE guacamole_entity SET name='gateway-admin' WHERE name='guacadmin' AND type='USER';
INSERT INTO guacamole_entity (name,type) VALUES ('presenter','USER');
INSERT INTO guacamole_user (entity_id,password_hash,password_salt,password_date) SELECT entity_id,decode('{presenter_hash}','hex'),decode('{presenter_salt}','hex'),CURRENT_TIMESTAMP FROM guacamole_entity WHERE name='presenter' AND type='USER';
INSERT INTO guacamole_user_permission (entity_id,affected_user_id,permission) SELECT e.entity_id,u.user_id,p.permission::guacamole_object_permission_type FROM guacamole_entity e JOIN guacamole_user u ON u.entity_id=e.entity_id CROSS JOIN (VALUES ('READ'),('UPDATE')) p(permission) WHERE e.name='presenter' AND e.type='USER';
INSERT INTO guacamole_connection (connection_name,protocol) VALUES ('Harborline - real Entra desktop','rdp');
INSERT INTO guacamole_connection_parameter (connection_id,parameter_name,parameter_value) SELECT connection_id,p.name,p.value FROM guacamole_connection CROSS JOIN (VALUES ('hostname','10.40.1.5'),('port','3389'),('security','nla'),('ignore-cert','false'),('resize-method','display-update'),('enable-drive','false'),('enable-printing','false'),('disable-audio','true')) p(name,value) WHERE connection_name='Harborline - real Entra desktop';
INSERT INTO guacamole_connection_permission (entity_id,connection_id,permission) SELECT e.entity_id,c.connection_id,'READ' FROM guacamole_entity e CROSS JOIN guacamole_connection c WHERE e.name='presenter' AND e.type='USER' AND c.connection_name='Harborline - real Entra desktop';
COMMIT;
"""
(base / 'init' / '002-presenter.sql').write_text(sql)
(base / 'presenter-credentials.json').write_text(json.dumps({'username':'presenter','password':presenter_password}))
(base / 'admin-credentials.json').write_text(json.dumps({'username':'gateway-admin','password':admin_password}))
for path in [base/'.env',base/'presenter-credentials.json',base/'admin-credentials.json',base/'init'/'002-presenter.sql']:
    os.chmod(path,0o600)
