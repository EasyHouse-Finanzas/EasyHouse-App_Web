# EasyHouse – Web Application (Frontend)

Aplicación web desarrollada en **Angular** para la simulación y visualización de créditos hipotecarios utilizando el *método francés*. Este sistema permite calcular cronogramas de pago, evaluar indicadores financieros y aplicar beneficios como el Bono Techo Propio, alineándose con los lineamientos de transparencia establecidos por la SBS.

Este frontend está diseñado para ser utilizado por **empresas inmobiliarias**, facilitando la comparación de alternativas de financiamiento para sus clientes en casetas de ventas.

---

## Introducción

En el Perú, el acceso a la vivienda es un objetivo social clave, apoyado por programas como **MiVivienda** y el **Bono Techo Propio**, regulados por la **SBS**. La información financiera suele ser compleja y poco accesible para los usuarios, por lo que este sistema busca simplificar y transparentar los cálculos hipotecarios.

El frontend ofrece una interfaz intuitiva que permite:

- Simular créditos bajo el método francés.
- Aplicar tasas nominales o efectivas.
- Calcular créditos en soles o dólares.
- Incluir periodos de gracia.
- Aplicar el Bono Techo Propio.
- Calcular VAN y TIR de forma clara.

---

## Objetivo del Proyecto

Desarrollar una aplicación web interactiva que permita simular créditos hipotecarios de forma precisa, transparente y fácil de interpretar, apoyando la toma de decisiones de clientes inmobiliarios.

---

## Tecnologías Utilizadas

- **Angular 16+**
- **TypeScript**
- **HTML5 / CSS3 / SCSS**
- **Angular Material**
- **RxJS**
- **HttpClient (consumo de APIs)**
- **Integración con .NET Backend**

---

## Características del Frontend

###  Simulación de Créditos
- Cuotas constantes (método francés)
- Intereses, amortización y saldos por periodo
- Créditos en moneda nacional o extranjera

###  Tasas y Beneficios
- Tasa nominal o efectiva
- Aplicación del Bono Techo Propio
- Períodos de gracia total o parcial

###  Indicadores Financieros
- **VAN** (Valor Actual Neto)
- **TIR** (Tasa Interna de Retorno)

###  Interfaz optimizada
Pensada para casetas de ventas y demostraciones rápidas.

---

## Instalación y Ejecución

```bash
npm install
ng serve -o

