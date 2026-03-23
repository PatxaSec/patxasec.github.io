
![image](Imágenes/20250707081843.png)

---

As is common in real life Windows pentests, you will start the Voleur box with credentials for the following account: `ryan.naylor` / `HollowOct31Nyt`

---

# Enumeración Inicial

Enumerando los `SHARE`s encontramos un archivo interesante:

![image](Imágenes/20250707164625.png)


![image](Imágenes/20250707165112.png)

![image](Imágenes/20250707165716.png)

Nos descargamos el `Access_Review.xlsx` y crackeamos su credencial de lectura con `john`.

![image](Imágenes/20250707170914.png)

Dentro del archivo, podemos observar las credenciales de barios usuarios.

![image](Imágenes/20250707173420.png)

Aprovechamos las credenciales de `svc_ldap` para ejecutar `BloodHound` y poseer una visión global.

![image](Imágenes/20250707173555.png)

# Acceso

Como `svc_ldap` ejecutamos `targetedKerberoast` para conseguir las credenciales de `svc_winrm`.

![image](Imágenes/20250707232735.png)

![image](Imágenes/20250707232003.png)

Conseguimos la `user.txt`

![image](Imágenes/20250707233058.png)

# Movimiento lateral y Escalada

Aprovechando las credenciales de `svc_ldap` restauramos al usuario `todd.wolfe`


![image](Imágenes/20250708002203.png)

![image](Imágenes/20250708002221.png)

![image](Imágenes/20250714221504.png)

Como usuario `todd.wolfe`  nos conectamos por `smbclient` a `Second-Line` y con el objetivo de abusar de [DPAPI](https://www.thehacker.recipes/ad/movement/credentials/dumping/dpapi-protected-secrets#practice) nos descargamos `credential` y `masterkey`

![image](Imágenes/20250709022432.png)

Realizamos el abuso para crackear y conseguir las credenciales de `jeremy.cobs`  

![image](Imágenes/20250709022458.png)

![image](Imágenes/20250709022701.png)

Como `jeremy.combs` nos conectamos a `Third-Line` y nos descargamos el `id_rsa`, que pertenece a `svc_backup`.

![image](Imágenes/20250714214942.png)
![image](Imágenes/20250714215014.png)

Como usuario `svc_backup` usamos el `id_rsa` para descargar los registries de `/mnt/c/IT/Third-Line Support/Backups`, y ejecutamos `secretsdump`.

![image](Imágenes/20250714215416.png)

Ahora somos Administradores!

![image](Imágenes/20250714215616.png)


HAPPY HACKING

---

![image](Imágenes/20250714133853.png)