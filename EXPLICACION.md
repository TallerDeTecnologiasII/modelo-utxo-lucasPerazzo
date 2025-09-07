## EXPLICACIÓN EJERCICIO
    
- Para las verificaciones en norma general seguí la misma estructura en el for de la recorrida de los inputs o outputs. En la **primera** me basé en la pista de implementación pero con el problema de que al pushear el error me pedia un objeto ValidationError no un string.
- En la **segunda**, cree un contador que vaya sumando el importe de los inputs y otro de los outputs y luego comparo si son iguales. Aunque verifico que el utxo exista en la verificación 1 como no paro la ejecución aunque no la cumpla, tengo que checkear que sea null para que no salte una excepción, si es null le sumo 0. Me resulto poco claro el como hayar la información del monto ya que en el input y en el output se encuentran de forma diferente. Para la tercera también me basé en la pista, solo que faltaba checkear que sea valido o no para tirar el error a la lista. 
- En la 4ta restricción cree una lista de ids de utxo y mediante iba recorriendo los inputs verificaba que no estén ya en la lista de utxosVistos y si lo estaban tiraba el error.
Para cumplir con un test que quedaba mal tuve que implementar un restricción que no admitiera valores negativos ni iguales a 0.
##### -------------------

- PD: Me hubiese gustado entregar el bonus pero me acordé tarde y no me dió tiempo
