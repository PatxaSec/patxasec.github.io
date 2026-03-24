
![image](Imágenes/20250707081843.png)

---

As is common in real life Windows pentests, you will start the Voleur box with credentials for the following account: `ryan.naylor` / `HollowOct31Nyt`

Este escenario representa un pentest interno con credenciales válidas de bajo privilegio.

El objetivo es evaluar:

- Qué información puede obtener un usuario autenticado
- Qué datos sensibles están expuestos en recursos compartidos
- Cómo escalar privilegios dentro del dominio a partir de credenciales filtradas

Este tipo de situaciones es muy común en entornos corporativos.

---

# Enumeración Inicial

El acceso a shares es uno de los vectores más relevantes en entornos internos.

Estos pueden contener:

- Documentación sensible
- Backups
- Credenciales en texto plano

Se prioriza su análisis.

Enumerando los `SHARE`s encontramos un archivo interesante:

![image](Imágenes/20250707164625.png)


![image](Imágenes/20250707165112.png)

![image](Imágenes/20250707165716.png)

Los documentos internos, especialmente hojas de cálculo, suelen contener información sensible.

En este caso, el archivo `Access_Review.xlsx` contiene credenciales protegidas mediante contraseña.

Nos descargamos el `Access_Review.xlsx` y crackeamos su credencial de lectura con `john`.

![image](Imágenes/20250707170914.png)

El acceso al documento revela múltiples credenciales.

Este tipo de exposición es crítica porque:

- Permite acceso a múltiples cuentas
- Facilita el movimiento lateral
- Reduce la necesidad de explotación técnica

Dentro del archivo, podemos observar las credenciales de barios usuarios.

![image](Imágenes/20250707173420.png)

Con nuevas credenciales (`svc_ldap`), se analiza el dominio mediante BloodHound.

El objetivo es identificar:

- Relaciones entre usuarios
- Permisos delegados
- Caminos de escalada

Aprovechamos las credenciales de `svc_ldap` para ejecutar `BloodHound` y poseer una visión global.

![image](Imágenes/20250707173555.png)

# Acceso

Como `svc_ldap` ejecutamos `targetedKerberoast` para conseguir las credenciales de `svc_winrm`.

![image](Imágenes/20250707232735.png)

![image](Imágenes/20250707232003.png)

Conseguimos la `user.txt`

![image](Imágenes/20250707233058.png)

# Movimiento lateral y Escalada

El abuso de privilegios permite restaurar cuentas deshabilitadas.

Esto es relevante porque:

- Permite reactivar identidades legítimas
- Facilita el movimiento lateral
- Puede pasar desapercibido en entornos reales

Aprovechando las credenciales de `svc_ldap` restauramos al usuario `todd.wolfe`


![image](Imágenes/20250708002203.png)

![image](Imágenes/20250708002221.png)

![image](Imágenes/20250714221504.png)

Como usuario `todd.wolfe`  nos conectamos por `smbclient` a `Second-Line` y con el objetivo de abusar de [DPAPI](https://www.thehacker.recipes/ad/movement/credentials/dumping/dpapi-protected-secrets#practice) nos descargamos `credential` y `masterkey`

DPAPI protege credenciales en sistemas Windows.

Sin embargo, si se dispone de:

- Credenciales del usuario
- Acceso a masterkeys

Es posible descifrar secretos protegidos.

![image](Imágenes/20250709022432.png)

Realizamos el abuso para crackear y conseguir las credenciales de `jeremy.cobs`  

![image](Imágenes/20250709022458.png)

![image](Imágenes/20250709022701.png)

El acceso a shares adicionales permite descubrir nuevas credenciales, en este caso una clave privada SSH (`id_rsa`).

Este tipo de hallazgos es común en entornos donde:

- Se reutilizan credenciales
- No se protegen adecuadamente los backups

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

## Conclusión

Este escenario demuestra cómo:

- La exposición de credenciales en recursos internos
- Puede derivar en compromiso total del dominio

A través de:

- Análisis de documentos
- Kerberoasting
- Abuso de cuentas
- DPAPI
- Acceso a backups

El factor clave es la acumulación de pequeñas debilidades.

Este tipo de cadenas es extremadamente común en entornos reales.