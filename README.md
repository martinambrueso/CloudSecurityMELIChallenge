# Cloud Security MELI

# Instalacion

En primer lugar, clone el repositorio para comenzar.
```bash
git clone https://github.com/martinambrueso/CloudSecurityMELIChallenge
```
Seguidamente, modifique la linea 8 del swagger (./app/src/swagger.json):
```json
"host": "SU_IP_LOCAL:3000",
```
Sobre la raíz del proyecto, genere la carpeta my-datavolume:
```bash
mkdir my-datavolume
```
Por ultimo, construya e inicie:
```bash
docker-compose build
docker-compose up
```
BASE URL:
```bash
http://ip_local:3000/api/v1/
```
SWAGGER URL:
```bash
http://ip_local:3000/api-docs/
```

## Consideraciones generales

- Para la solución del dominio del problema no se enfatizo en las practicas de programación. Si bien se busco un código escalable, claro que puede mejorar.

- En este caso se opto por persistir la información en una base de datos SQL relacional, pero seria conveniente, en caso de pasar a ambiente productivo, usar una base de datos Redis en memoria por las siguientes razones:

  - El dominio del problema se amolda bien, no es un set de datos muy grande, y no cuenta con complejidades en cuanto a relaciones.
  - Aportaría grandes beneficios en cuanto a velocidad de lectura, son bases de datos en memoria y constan de un esquema de clave/valor.
  - Se puede optar por persistir la información, resignando un poco de velocidad, pero aun así no nos afectaría, ya que la replicación de las fuentes de datos no va a ser constante, sino con ciertas ventanas de tiempo.

- Se opto por hacer replicas contra las fuentes de datos cada 30 minutos, esto evitara bloqueos por parte de las mismas, de hecho, un de las fuentes da advertencia de bloqueo permanente si se excede demasiadas veces en cuanto a peticiones cada 30 minutos.

- En este caso no se utilizo ORM a la hora de definir modelos, pero es conveniente si se va a pasar a producción para escalabilidad del modelo de datos.

- Se propone que la replicación sea ejecutada únicamente por cronjob con token autorizado, y restringir las peticiones al endpoint para que únicamente pueda hacerse desde la red corporativa sobre determinados equipos.

Cronjob Linux
```bash
*/30 * * * *  user   curl -X POST 
"http://host/api/v1/replicate?apiToken=apiToken&user=user" -H 
"accept: application/json" -H  
"authorization: jwt" -H  
"Content-Type: application/json" -d 
"{  \"ds\": [    \"urls\"  ]}"
```

- O bien se puede programar un script python para que obtenga un token valido y de igual manera, siendo ejecutado únicamente con cronjobs.

Obteniendo token:

```python
import requests

body = {'user': 'somevalue', 'pass': 'pass', 'email': 'email'}

result = requests.post('http://host/api/v1/login?apiToken=apiToken', data = body )

token = result.token
```
Replicando desde python:

```python
import requests

body = {'ds': ['url1','url2',...]}

result = requests.post('http://host/api/v1/replicate?user=user=apiToken=apiToken',
headers={"Content-Type":"application/json"}, 
headers = {"Authorization":"Bearer " + token},
data = body )

```
Como se puede ver, el enpoint recibe una lista de urls, que son las fuentes de las cuales replicara. Para mas información revisar swagger de documentacion.

Entonces, el cronjob

```bash
*/30 * * * *  user   python ./replicate.py
```

ACLARACION: Todos los tokens firmados tienen una duración máxima de 2 minutos, se puede configurar. Para mas información revisar swagger.


## Consideraciones técnicas

* Para esta ocasión no se configuro certificado, seria conveniente configurar OpenSSL y autofirmar uno para agregarlo a la entidad de confianza del dominio y difundirlo. Esto en caso de pasar a ambiente productivo, o bien, si va a estar publico, se puede usar Let’s Encrypt y actualizarlo periódicamente.

* La tabla de usuarios deberia ser dividida, a fines de resolver el reto se opto por manejar todo en una sola entidad, pero es conveniente si se desea hacer un esquema de autorizaciones mas amplio, en este caso solo se valida si hay presencia de admin o no.

* Se encriptan datos sensibles del usuario con AES, como password y apiToken, pero no se agrego factor sal a los hashes. Si bien para este propósito cumple, es conveniente agregar el factor, actualmente es propenso a fuerza bruta o ataques de Rainbow table.

* No se realizaron test de inyección SQL, pero mas que nada por la sencilla razón de que es una de las formas de persistir información, no así la mas conveniente. De todas maneras se hizo la sanitización de entradas y gran parte de la seguridad de las querys esta en buenas manos con la librería. A pesar de ello, es conveniente hacer un escaneo en caso de salir a producción.

* Las sesiones se gestionan con Json Web Token, los payloads se armaron con un esquema basico, y longitud de firma corta, por cuestiones de simplicidad, pero es importante aumentar el tamaño de la firma y hacer una gestión mas estricta de la carga util. A fines de este caso nos va a dar la capa de protección adecuada. Duración Máxima de los tokens: 120 segundos.

* El esquema de roles y permisos es muy sencillo, solo se valida rol de admin, y en base a eso se restringe en los middlewares (revisar comentarios de ./src/routes/ipcollector.js)

* Los logs de auditoria se implementaron con Winston, se los agrego como middleware en todas las rutas para registrar cada operación con detalles. Se agrega configuración para Logstash, en este caso no agregue la imagen ni las enlace, pero basta con reemplazar los datos en el archivo de Winston. Adicionalmente ahora esta configurado para registrar en un archivo llamado audit.log.

# Implementación en la nube
* La implementación va a depender de cual sea el nivel de concurrencia del recurso, si no va a tener mucha carga de solicitudes, carece de propósito para configurar un ambiente de alta disponibilidad.

* Por el contrario, si necesitamos que sea un ambiente productivo altamente demandado, vamos a tener que pensar en una escalabilidad horizontal y vertical. 

* Para este caso puntual vamos a plantear la implementación sobre la nube de AWS.
* Se propone armar un cluster de instancias virtuales EC2, comenzando con instancias de tipo T2, ya que las mismas permiten hacer un escalado vertical con capacidades bastante superiores.
* AWS cuenta con balanceadores de carga nativos, y también se encargan de autogestionar en casos de instancias que dejan de funcionan. Con lo cual, el esquema de alta disponibilidad lo dejamos enteramente en manos de AWS.
* Todas las instancias deben estar dentro de una VPC AWS(Amazon Virtual Private Cloud)
* Con este esquema tenemos tanto escalamiento horizontal como vertical, horizontal ya que podemos aumentar la capacidad de las instancias EC2, podemos cambiar la capacidad sin alterar ninguna parte del flujo.
* Escalamiento vertical, ya que podemos agregar tantas replicas de instancias del servicio en la VPC como necesitemos sobre el cluster, si aumenta la demanda no supone grandes cambios. 
* Lo mas conveniente es usar AMIs de Ubuntu server (Amazon Machine Images), están cargadas en los catálogos y hay distintos tipos de imágenes dependiendo del alcance. Las mismas están listas y preconfiguradas para hacer uso. Por lo general, configuraciones de acceso remoto y seguridad ya están hechas, el resto de configuraciones son puntuales del ambiente que se vaya a desplegar.
* La gestión de estas instancias pueden hacerse de manera manual, mediante el panel administrable, y también mediante SDKs o CLIs. Esto es altamente recomendable para clusters numerosos, para tareas de automatizacion. Ademas cuentan con soporte de herramientas como Ansilble y Terraform.

Ejemplo de creacion de instancia mediante CLI:
```bash
aws ec2 run-instances --image-id ami-xxxxxxxx 
    --count 1 
    --instance-type t2.micro 
    --key-name MyKeyPair 
    --security-group-ids sg-903004f8 
    --subnet-id subnet-6e7f829e
```
Ejemplo con Terraform:
```bash
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    Name = "HelloWorld"
  }
}
```
