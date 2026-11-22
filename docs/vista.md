**Nombre del Caso de uso:** Consultar seguimiento de bolsines | **Nro. de orden:** 36
**Prioridad:** Alta
**Complejidad:** Mediano
**Actor Principal:** Encargado de Bolsines (EB) | **Actor Secundario:** GPS Tracker, Servidor Google Maps
**Tipo de Caso de uso:** Concreto
**Objetivo:** Consultar en un mapa la ubicación de los bolsines que están en movimiento entre comisiones médicas.
**Flujo Descripto: Búsqueda de bolsines y visualización en el mapa con GPS Tracker modelo XTR-4500L**

1. EB: selecciona la opción para consultar la ubicación de uno o varios bolsines.
2. Sistema: busca y muestra la CM del usuario logueado.
3. Sistema: busca los bolsines en estado *Enviado* cuya CM origen es igual a la CM del usuario logueado.
4. Sistema: solicita al dispositivo GPS Tracker los datos de localización de los bolsines.
5. Sistema: recibe del dispositivo GPS Tracker los datos de localización de cada uno de esos bolsines (ver observación 1).
6. Sistema: muestra en tiempo real sobre un mapa la posición de los bolsines, permitiendo seleccionar un bolsín del mapa o filtrar por número de precinto o CM destino.
7. EB: selecciona un bolsín del mapa.
8. Sistema: permite enviar un correo electrónico al Gerente de Comisión Médica destino para informar la ubicación del Bolsín.
9. EB: selecciona la opción.
10. Sistema: busca la dirección de correo electrónico del GCM destino.
11. Sistema: para informar número de bolsín, fecha y hora de última actualización, y las coordenadas del bolsín, se incluye al *Caso de Uso 31 Notificar ubicación de bolsín*. Fin del caso de uso.

**Flujos Alternativos**

* A1: No se encuentran bolsines en estado enviado.
* A2: No se encuentra bolsín con el número de precinto ingresado.
* A3: El GPS Tracker no pudo informar ubicación del bolsín.
* A4: El EB cancela la ejecución del caso de uso.
* A5: El EB no selecciona la opción para enviar un correo electrónico.

**Observación 1:** Los modelos disponibles de GPS Tracker son XTR-4500L, NavTrack QX-7A y GeoPulse MTR-900:

1. El modelo **XTR-4500L** tiene un endpoint llamado **getBolsinLocation()** que recibe una API Key identificatoria, un número de bolsín en formato entero y un código de comisión médica origen en formato String. Devuelve un JSON en formato cadena de caracteres que contiene para cada ítem el número de bolsín, la latitud, la longitud y la fecha y hora de la última actualización de ubicación.
2. El modelo **NavTrack QX-7A** tiene un endpoint llamado **retrieveTrackingData()** que recibe una API Key identificatoria, un número de bolsín en formato entero y un código de comisión médica destino en formato String. Devuelve un único String con sus ítems separados por comas con el número de bolsín, la latitud, la longitud y la fecha y hora de la última actualización de ubicación.
3. El modelo **GeoPulse MTR-900** tiene un endpoint llamado **fetchCargoPositions()** que recibe una API Key identificatoria y un número de bolsín formato entero. Devuelve una matriz con el número de bolsín, la latitud, la longitud y la fecha y hora de la última actualización de posición.
En todos los casos se debe procesar la información y recuperar el listado de bolsines con su número, su ubicación actual (latitud y longitud) y la fecha y hora de la última actualización de posición.