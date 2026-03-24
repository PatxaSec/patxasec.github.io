

![image](Imágenes/20250716090445.png)


Este escenario simula un acceso inicial con credenciales válidas en un entorno corporativo.

El objetivo no es únicamente obtener acceso a un sistema, sino evaluar hasta dónde se puede escalar dentro de la infraestructura, pivotando entre servicios internos.

As is common in real life pentests, you will start the Outbound box with credentials for the following account `tyler` / `LhKL1o9Nm3X2`
---

# Enumeración inicial


![image](Imágenes/20250716090459.png)

-> `/etc/hosts`

```
10.10.11.77    outbound.htb mail.outbound.htb
```
Se identifican dos servicios principales:

- Web application (probable vector inicial)
- Servicio de correo (Roundcube)

La combinación de aplicación web + correo suele ser un vector crítico en entornos reales, especialmente por la gestión de credenciales y sesiones.

![image](Imágenes/20250716093026.png)

# Acceso

Dado que la aplicación web está expuesta y se dispone de credenciales, se prioriza la búsqueda de vulnerabilidades en el backend.

Este tipo de enfoque permite:

- Obtener ejecución de código
- Acceder a credenciales internas
- Pivotar hacia otros servicios

Utilizamos el exploit de [CVE-2025-49113](https://github.com/hakaioffsec/CVE-2025-49113-exploit) para conseguir acceso como `www-data` mediante una reverse-shell.

![image](Imágenes/20250716093802.png)

El acceso como `www-data` permite:

- Enumerar el sistema local
- Buscar credenciales almacenadas
- Identificar servicios internos accesibles

El objetivo en este punto es escalar desde acceso web hacia cuentas con mayor privilegio.

Investigando en el servidor encontramos scripts interesantes:

![image](Imágenes/20250716094156.png)

Los scripts encontrados en el sistema sugieren almacenamiento de credenciales en texto plano o reutilizables.

Este tipo de hallazgos es común en aplicaciones web mal securizadas.

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

Las credenciales obtenidas desde la base de datos permiten acceder a otros servicios internos.

En este caso, se reutilizan en el servicio de correo (Roundcube), lo que permite:

- Acceso a comunicaciones internas
- Descubrimiento de nuevas credenciales

Accedemos al servicio de roundcube usando la credencial, y podemos ver un correo en el que leemos en texto plano la credencial ssh del usuario.

![image](Imágenes/20250716102712.png)

El acceso al correo permite descubrir credenciales en texto plano, lo cual es una debilidad común en entornos corporativos.

Este tipo de vector es especialmente crítico porque:

- No requiere explotación adicional
- Permite escalada directa entre servicios

Nos logueamos por ssh:

![image](Imágenes/20250716102906.png)

Conseguimos el `user.txt`


# Movimiento lateral y Escalada

Una vez obtenido acceso como usuario del sistema, se realiza enumeración de privilegios mediante `sudo -l`.

El objetivo es identificar:

- Binarios ejecutables como root
- Restricciones aplicadas
- Posibles vectores de bypass

Vemos qué comandos puede ejecutar `jacob` con `sudo` sin contraseña.

![image](Imágenes/20250716103134.png)

La configuración de sudo permite ejecutar `/usr/bin/below` como root sin contraseña.

Este binario presenta una vulnerabilidad que permite:

- Escritura arbitraria mediante symlink
- Modificación de archivos críticos del sistema
- Escalada directa a root

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


## Conclusión

Este escenario demuestra cómo:

- Un acceso inicial limitado (web)
- Puede escalar hasta control total del sistema

A través de:

- Explotación de vulnerabilidades en aplicaciones web
- Exposición de credenciales en sistemas internos
- Reutilización de credenciales entre servicios
- Configuraciones inseguras en sudo

El compromiso completo no depende de una única vulnerabilidad, sino de la capacidad de encadenar múltiples vectores.

Este tipo de escenarios es representativo de entornos reales.