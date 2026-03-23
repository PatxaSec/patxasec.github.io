

![image](Imágenes/20250716090445.png)

As is common in real life pentests, you will start the Outbound box with credentials for the following account `tyler` / `LhKL1o9Nm3X2`

---

# Enumeración inicial


![image](Imágenes/20250716090459.png)

-> `/etc/hosts`

```
10.10.11.77    outbound.htb mail.outbound.htb
```


![image](Imágenes/20250716093026.png)

# Acceso

Utilizamos el exploit de [CVE-2025-49113](https://github.com/hakaioffsec/CVE-2025-49113-exploit) para conseguir acceso como `www-data` mediante una reverse-shell.

![image](Imágenes/20250716093802.png)

Investigando en el servidor encontramos scripts interesantes:

![image](Imágenes/20250716094156.png)

Investigando un poco mas a fondo encontramos credenciales de acceso a un servicio `mysql` local. 

![image](Imágenes/20250716095440.png)

Nos conectamos al serrvicio `mysql`.

![image](Imágenes/20250716100938.png)

Enumeramos las tablas disponibles:

![image](Imágenes/20250716101123.png)

Encontramos datos cifrados en `base64` dentro de la tabla `session`.

![image](Imágenes/20250716101450.png)

![image](Imágenes/20250716101508.png)

En base a prueba y error, encontramos lo que parece un hash para acceder al servicio de mail con el usuario `jacob`.

![image](Imágenes/20250716101857.png)

Crackeamos el hash encontrado mediante el uso del script `decript.sh` encontrado previamente en `/var/www/html/roundcube/bin/`

![image](Imágenes/20250716102424.png)

Accedemos al servicio de roundcube usando la credencial, y podemos ver un correo en el que leemos en texto plano la credencial ssh del usuario.

![image](Imágenes/20250716102712.png)

Nos logueamos por ssh:

![image](Imágenes/20250716102906.png)

Conseguimos el `user.txt`


# Movimiento lateral y Escalada


Vemos qué comandos puede ejecutar `jacob` con `sudo` sin contraseña.

![image](Imágenes/20250716103134.png)
Vemos que el usuario `jacob` puede ejecutar `/usr/bin/below` como **cualquier usuario** sin necesidad de contraseña. Mediante **cualquier argumento**, excepto los que empiecen con `--config`, `--debug`, o `-d`.

Podemos aprovecharnos de esto con el siguiente [CVE-2025-27591](https://github.com/BridgerAlderson/CVE-2025-27591-PoC/blob/main/exploit.py):

- **Crea un symlink**:  
    Apunta `/var/log/below/error_root.log` → `/etc/passwd`.
- **Ejecuta** `sudo /usr/bin/below record`, que:
    - Es ejecutado como `root` sin contraseña (según la configuración de `sudo -l`).
    - Intenta escribir logs en `/var/log/below/error_root.log`, que **apunta a `/etc/passwd`**.
- Como resultado, **`below` intenta escribir como root en `/etc/passwd`**.
- Luego, el script **abre `/etc/passwd` (a través del symlink)** y le hace `f.write(...)`, lo que:
    - Añade una línea de usuario malicioso (`attacker::0:0:...`).
    - Y altera los permisos de `/etc/passwd` al haber truncado o reescrito el archivo.

![image](Imágenes/20250716113746.png)

`HAPPY HACKING`

![image](Imágenes/20250716104309.png)
