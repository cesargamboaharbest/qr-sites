// Términos y condiciones de Dashi. The landing page has a copy of this file
// (dashi/src/terms.js): keep both in step when the text changes.

export const COMPANY = {
  name: 'Dashi',
  address: 'Costa Rica',
  email: 'dashimenu.cr@gmail.com',
  whatsapp: '+506 8432 7690',
  whatsappUrl: 'https://wa.me/50684327690',
  instagram: '@dashi.cr',
  instagramUrl: 'https://www.instagram.com/dashi.cr/',
}

export const TERMS_UPDATED = '17 de octubre de 2026'

export const TERMS = [
  {
    title: '1. Identificación del proveedor',
    paragraphs: [
      `El presente documento regula el acceso y uso de la plataforma Dashi (en adelante, la “Plataforma”), operada por ${COMPANY.name}, con domicilio en ${COMPANY.address} (en adelante, “Dashi”, “nosotros” o el “Proveedor”).`,
      `Medios de contacto: correo electrónico ${COMPANY.email}, WhatsApp ${COMPANY.whatsapp} e Instagram ${COMPANY.instagram}.`,
    ],
  },
  {
    title: '2. Aceptación de los términos',
    paragraphs: [
      'Al registrarse, acceder o utilizar la Plataforma, incluyendo escanear un código QR de Dashi y enviar un pedido, la persona usuaria declara haber leído, entendido y aceptado íntegramente estos Términos y Condiciones, los cuales constituyen un acuerdo vinculante con Dashi. Si el Usuario actúa en nombre de una persona jurídica o de un comercio, declara contar con facultades suficientes para obligarlo.',
      'La aceptación se realiza por medios electrónicos y tiene plena validez y eficacia jurídica conforme a la Ley N.° 8454, Ley de Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica.',
      'Si el Usuario no está de acuerdo con estos Términos, debe abstenerse de utilizar la Plataforma.',
    ],
  },
  {
    title: '3. Definiciones',
    bullets: [
      '“Plataforma” o “Servicio”: el software de menú digital y pedidos por mesa Dashi, ofrecido bajo la modalidad de software como servicio (SaaS), incluyendo el sitio web, los menús públicos, el panel de administración, el panel de pedidos para meseros y sus actualizaciones.',
      '“Comercio” o “Cliente”: la persona física o jurídica que contrata el Servicio para uno o varios restaurantes, sodas, cafeterías, bares u otros locales.',
      '“Usuario”: toda persona que accede a la Plataforma con credenciales, ya sea el dueño de la cuenta del Comercio o los meseros y el personal que este autorice.',
      '“Comensal”: la persona que, sin necesidad de registrarse, consulta el menú de un Comercio mediante un código QR o enlace y, en su caso, envía un pedido.',
      '“Contenido del Comercio”: los datos e información que el Comercio o sus Usuarios cargan o generan en la Plataforma, tales como nombre y logo del local, productos, fotografías, descripciones, precios, secciones, mesas, códigos QR y pedidos.',
      '“Datos personales”: toda información relativa a una persona física identificada o identificable, según la legislación aplicable en materia de protección de datos.',
    ],
  },
  {
    title: '4. Objeto y descripción del servicio',
    paragraphs: [
      'Dashi es una herramienta que permite a los Comercios publicar un menú digital, generar un código QR por mesa, recibir los pedidos que envían los Comensales desde su teléfono y gestionarlos en un panel para el personal (estados Nuevo, Preparando, Servido o Cancelado). Según el plan contratado, permite además crear cuentas para meseros, consultar estadísticas como escaneos por mesa y productos más vendidos, y administrar varios locales desde una sola cuenta.',
      'El Servicio se presta de forma remota a través de Internet, bajo la modalidad de suscripción, y no incluye la provisión de hardware (teléfonos, tablets o computadoras), la impresión de los códigos QR, la conectividad a Internet ni servicios de asesoría contable, tributaria, sanitaria o legal.',
      'Dashi no procesa pagos de los Comensales, no vende los productos del menú ni interviene en la relación de consumo entre el Comercio y el Comensal. El cobro de los pedidos se realiza directamente en el local, por los medios que defina el Comercio.',
    ],
  },
  {
    title: '5. Responsabilidades del Comercio',
    paragraphs: ['El Comercio es el único responsable de:'],
    bullets: [
      'La exactitud y actualización de su menú: productos, descripciones, fotografías, precios, moneda y disponibilidad (incluido marcar como agotados los productos que no pueda ofrecer).',
      'Informar a los Comensales sobre ingredientes, alérgenos y demás información que exija la normativa sanitaria y de etiquetado aplicable.',
      'Indicar en sus precios o en el local los impuestos y cargos aplicables, como el Impuesto al Valor Agregado (IVA) y el cargo por servicio, conforme a la ley.',
      'Preparar, entregar y cobrar los pedidos recibidos, así como emitir el comprobante electrónico correspondiente a sus ventas.',
      'Atender los reclamos de los Comensales y cumplir con la Ley N.° 7472 de Promoción de la Competencia y Defensa Efectiva del Consumidor y la normativa sanitaria, municipal y tributaria aplicable a su actividad.',
      'Colocar los códigos QR en las mesas correctas y revisar periódicamente el panel de pedidos durante su horario de atención.',
    ],
  },
  {
    title: '6. Uso de la Plataforma por los Comensales',
    bullets: [
      'Los Comensales pueden consultar el menú y enviar pedidos sin descargar aplicaciones ni registrarse.',
      'Al enviar un pedido, este se transmite al Comercio para su preparación. La aceptación, preparación, entrega, precio final y cobro del pedido corresponden exclusivamente al Comercio.',
      'Dashi no garantiza la disponibilidad de los productos, los tiempos de preparación ni la calidad de lo servido. Cualquier reclamo sobre el pedido debe dirigirse al Comercio.',
      'El Comensal se obliga a utilizar el Servicio de buena fe y a no enviar pedidos falsos, abusivos o desde una mesa distinta a la que ocupa.',
      'Se recomienda no incluir datos personales ni información sensible en las notas del pedido.',
    ],
  },
  {
    title: '7. Registro, cuentas y credenciales',
    bullets: [
      'El acceso al panel de administración requiere una cuenta con correo electrónico y contraseña. Las cuentas de meseros son creadas y eliminadas por el dueño de la cuenta del Comercio.',
      'Las credenciales son personales e intransferibles. Cada Usuario es responsable de su custodia y de toda actividad realizada con ellas.',
      'El Comercio es responsable de las acciones de sus meseros y personal en la Plataforma, y de eliminar el acceso de quienes dejen de colaborar con él.',
      'El Comercio se obliga a suministrar información veraz, exacta y actualizada, y a mantenerla al día.',
      `El Usuario debe notificar a Dashi de inmediato cualquier uso no autorizado o compromiso de sus credenciales, al correo ${COMPANY.email}.`,
      'Dashi podrá suspender cuentas cuando existan indicios razonables de uso indebido, fraude, riesgo de seguridad o incumplimiento de estos Términos.',
    ],
  },
  {
    title: '8. Licencia de uso',
    paragraphs: [
      'Dashi otorga al Comercio una licencia limitada, revocable, no exclusiva, no sublicenciable e intransferible para acceder y utilizar la Plataforma durante la vigencia de la suscripción y únicamente para la operación de sus propios locales.',
      'Esta licencia no implica la transferencia de ningún derecho de propiedad intelectual sobre la Plataforma ni sobre sus componentes.',
    ],
  },
  {
    title: '9. Uso aceptable y conductas prohibidas',
    paragraphs: ['El Usuario y el Comensal se obligan a no:'],
    bullets: [
      'Utilizar la Plataforma con fines ilícitos, fraudulentos o contrarios a la moral, el orden público o la buena fe.',
      'Publicar en el menú productos cuya venta esté prohibida, contenido ofensivo, engañoso o que infrinja derechos de terceros.',
      'Copiar, modificar, descompilar, realizar ingeniería inversa o crear obras derivadas de la Plataforma, salvo en los supuestos permitidos por ley.',
      'Revender, arrendar, ceder o poner la Plataforma a disposición de terceros sin autorización escrita de Dashi.',
      'Acceder o intentar acceder a cuentas, datos o sistemas ajenos, ni vulnerar las medidas de seguridad de la Plataforma. Estas conductas pueden constituir delito conforme a la Ley N.° 9048 de Delitos Informáticos de Costa Rica.',
      'Introducir código malicioso, enviar pedidos de forma automatizada o masiva, o ejecutar acciones que degraden, sobrecarguen o interrumpan el Servicio.',
      'Utilizar procesos automatizados de extracción masiva de información (scraping) sin autorización previa y escrita.',
    ],
  },
  {
    title: '10. Contenido del Comercio',
    paragraphs: [
      'El Contenido del Comercio es y permanece en todo momento de su exclusiva titularidad. Dashi no adquiere derecho de propiedad alguno sobre dicha información.',
      'El Comercio otorga a Dashi una licencia limitada, gratuita y no exclusiva para alojar, procesar, respaldar y mostrar el Contenido del Comercio, incluida su publicación en los menús públicos accesibles mediante los códigos QR y enlaces del Comercio, únicamente en la medida necesaria para prestar y mantener el Servicio.',
      'El Comercio declara y garantiza que cuenta con los derechos sobre las fotografías, logotipos, marcas y textos que publica, y responde por su exactitud, licitud y actualización.',
      'Dashi podrá utilizar la información registrada en la Plataforma con la finalidad exclusiva de operar, mantener y mejorar el Servicio, y generar estadísticas agregadas y anonimizadas, sin posibilidad de identificar al Comercio ni a los Comensales.',
      'Dashi NO vende, alquila, comercializa ni cede el Contenido del Comercio ni los datos personales a terceros con fines comerciales o publicitarios. La información únicamente podrá compartirse con: (i) proveedores de infraestructura tecnológica (alojamiento, bases de datos y almacenamiento de imágenes) que actúan como encargados del tratamiento, sujetos a obligaciones de confidencialidad y seguridad, y estrictamente en lo necesario para prestar el Servicio; (ii) autoridades competentes, cuando medie requerimiento legal o judicial; y (iii) terceros expresamente autorizados por el Comercio por escrito.',
    ],
  },
  {
    title: '11. Protección de datos personales',
    paragraphs: [
      'Dashi trata los datos personales conforme a la Ley N.° 8968, Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica, y su Reglamento (Decreto Ejecutivo N.° 37554-JP), bajo la supervisión de la Agencia de Protección de Datos de los Habitantes (PRODHAB).',
      'Datos que se recopilan: de los Usuarios, el correo electrónico y la contraseña, la cual se almacena cifrada; de los Comensales, únicamente el contenido del pedido (productos, cantidades, notas y mesa) y el número de escaneos de cada código QR. Dashi no solicita a los Comensales nombre, teléfono, correo ni datos de pago.',
      'Finalidades del tratamiento: prestación y administración del Servicio, autenticación y control de accesos, transmisión de los pedidos al Comercio, estadísticas de uso para el Comercio, soporte técnico, facturación, seguridad de la información, mejora del producto y comunicaciones relacionadas con el Servicio.',
      'Respecto de los pedidos y demás Contenido del Comercio, el Comercio actúa como responsable del tratamiento y Dashi como encargado, limitándose a tratar los datos según lo previsto en estos Términos.',
      `Las personas titulares pueden ejercer sus derechos de acceso, rectificación, actualización, eliminación y revocatoria del consentimiento, así como oponerse al tratamiento, escribiendo a ${COMPANY.email}. Dashi atenderá la solicitud dentro de los plazos establecidos por la legislación aplicable.`,
      'Dashi aplica medidas técnicas y organizativas razonables para proteger la información, como el cifrado de las comunicaciones y de las contraseñas, y el control de accesos por roles (dueño y mesero). Ningún sistema es infalible, por lo que no puede garantizarse una seguridad absoluta.',
      'Los datos podrán alojarse en servidores de proveedores de infraestructura en la nube ubicados fuera de Costa Rica. En tales casos, Dashi procura que dichos proveedores ofrezcan niveles de protección adecuados.',
      'En caso de una violación de seguridad que afecte datos personales, Dashi notificará al Comercio sin demora injustificada y colaborará en las comunicaciones que correspondan.',
      'Los datos se conservarán durante la vigencia de la relación contractual y, posteriormente, por los plazos legales aplicables.',
    ],
  },
  {
    title: '12. Confidencialidad',
    paragraphs: [
      'Cada parte se obliga a mantener la confidencialidad de la información no pública de la otra a la que acceda con ocasión del Servicio, como las ventas y pedidos del Comercio, y a no divulgarla a terceros sin autorización escrita, salvo requerimiento de autoridad competente.',
      'Esta obligación se mantendrá vigente durante la relación contractual y por dos (2) años posteriores a su terminación.',
    ],
  },
  {
    title: '13. Planes, precios y facturación',
    bullets: [
      'El uso de la Plataforma por parte del Comercio está sujeto al plan y tarifa mensual vigentes publicados en el sitio web de Dashi o acordados con el Comercio. Dashi no cobra comisiones por pedido.',
      'Los Comensales no pagan a Dashi por consultar el menú ni por enviar pedidos.',
      'Salvo que se indique lo contrario, los precios de los planes no incluyen el Impuesto al Valor Agregado (IVA) ni otros tributos aplicables, los cuales se agregarán conforme a la Ley N.° 9635 de Costa Rica.',
      'Dashi emitirá el comprobante electrónico de conformidad con la normativa de facturación electrónica vigente.',
      'La falta de pago dentro del plazo convenido faculta a Dashi a suspender el acceso al Servicio o a las funciones del plan, previa notificación al Comercio, sin perjuicio del cobro de los montos adeudados.',
      'Los ajustes de tarifas se comunicarán con al menos treinta (30) días naturales de antelación a su entrada en vigencia.',
    ],
  },
  {
    title: '14. Propiedad intelectual',
    paragraphs: [
      'La Plataforma, su código fuente, bases de datos, diseño, interfaces, temas de menú, marcas, nombres comerciales, logotipos y documentación son propiedad exclusiva de Dashi o de sus licenciantes, y están protegidos por la Ley N.° 6683 sobre Derechos de Autor y Derechos Conexos, la Ley N.° 8039 de Procedimientos de Observancia de los Derechos de Propiedad Intelectual de Costa Rica y los convenios internacionales aplicables.',
      'Queda prohibido cualquier uso no autorizado de dichos elementos. Las sugerencias o comentarios de mejora que el Comercio remita voluntariamente podrán ser incorporados por Dashi sin generar obligación de pago ni derecho de coautoría.',
    ],
  },
  {
    title: '15. Disponibilidad, mantenimiento y soporte',
    paragraphs: [
      'Dashi realizará esfuerzos comercialmente razonables para mantener la Plataforma disponible de forma continua, sin que ello constituya una garantía de disponibilidad ininterrumpida.',
      'Podrán realizarse ventanas de mantenimiento, que se procurará ejecutar en horarios de baja demanda. También podrán ocurrir interrupciones por causas ajenas a Dashi, como fallas de conectividad del Comercio o del Comensal, de proveedores de infraestructura o eventos de fuerza mayor. Se recomienda que el Comercio cuente con un medio alternativo para tomar pedidos en caso de interrupción.',
      'El soporte técnico se brinda por los canales indicados en la cláusula 1, en días y horarios hábiles.',
    ],
  },
  {
    title: '16. Garantías y limitación de responsabilidad',
    paragraphs: [
      'La Plataforma se proporciona “tal cual” y “según disponibilidad”. Dashi no garantiza que el Servicio esté libre de errores, ni que satisfaga necesidades específicas no pactadas expresamente.',
      'Dashi no será responsable por: los productos, precios, información o servicio que ofrece el Comercio; pedidos no atendidos, atrasados, erróneos o no cobrados; daños indirectos, lucro cesante o pérdida de ventas; ni por decisiones comerciales que el Comercio adopte con base en las estadísticas de la Plataforma.',
      'Salvo dolo o culpa grave, la responsabilidad total y acumulada de Dashi frente al Comercio se limita al monto efectivamente pagado por este en los doce (12) meses anteriores al hecho generador.',
      'Ninguna disposición de esta cláusula limita los derechos irrenunciables que la legislación de orden público reconozca a los Usuarios y Comensales, en particular los derivados de la Ley N.° 7472 cuando esta resulte aplicable.',
    ],
  },
  {
    title: '17. Indemnidad',
    paragraphs: [
      'El Comercio mantendrá indemne a Dashi, sus representantes y colaboradores frente a reclamos, sanciones o demandas de Comensales o terceros derivados del Contenido del Comercio, de los productos y servicios que ofrece, del uso indebido de la Plataforma o del incumplimiento de estos Términos o de la normativa aplicable.',
    ],
  },
  {
    title: '18. Vigencia, suspensión y terminación',
    bullets: [
      'La relación contractual se mantiene vigente mientras la suscripción del Comercio esté activa y al día.',
      'El Comercio puede solicitar la terminación en cualquier momento, mediante comunicación escrita a los canales oficiales, sin que ello genere derecho a la devolución de montos correspondientes a períodos ya facturados, salvo pacto en contrario.',
      'Dashi podrá suspender o terminar el Servicio por incumplimiento grave, falta de pago, uso indebido o requerimiento de autoridad competente, previa notificación cuando las circunstancias lo permitan.',
      'Al terminar la relación, los menús públicos y los códigos QR del Comercio dejarán de estar disponibles. El Comercio dispondrá de un plazo de treinta (30) días naturales para solicitar una copia de su información en un formato de uso común. Vencido ese plazo, Dashi podrá eliminar los datos, salvo aquellos cuya conservación sea legalmente obligatoria.',
    ],
  },
  {
    title: '19. Modificaciones a los términos',
    paragraphs: [
      'Dashi podrá modificar estos Términos para reflejar cambios en el Servicio o en la normativa aplicable. Las modificaciones sustanciales se comunicarán a los Comercios con al menos quince (15) días naturales de antelación, mediante la Plataforma o correo electrónico, y la versión vigente estará siempre publicada en esta página.',
      'El uso continuado del Servicio tras la entrada en vigencia de los cambios implica su aceptación. Si el Comercio no está de acuerdo, podrá dar por terminada la suscripción conforme a la cláusula 18.',
    ],
  },
  {
    title: '20. Fuerza mayor y caso fortuito',
    paragraphs: [
      'Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando este obedezca a eventos de fuerza mayor o caso fortuito, tales como desastres naturales, fallas generalizadas de telecomunicaciones o energía, actos de autoridad, conmoción civil o pandemias.',
    ],
  },
  {
    title: '21. Comunicaciones, cesión e integridad',
    paragraphs: [
      'Las comunicaciones entre las partes se realizarán por medios electrónicos a las direcciones registradas, y se tendrán por válidamente efectuadas desde su envío. Es responsabilidad del Comercio mantener actualizados sus datos de contacto.',
      'El Comercio no podrá ceder su posición contractual sin autorización previa y escrita de Dashi. Dashi podrá cederla en casos de reorganización, fusión o adquisición, manteniendo las condiciones pactadas.',
      'Si alguna cláusula fuera declarada nula o inaplicable, las demás conservarán plena vigencia. La tolerancia ante un incumplimiento no constituye renuncia a exigirlo posteriormente.',
    ],
  },
  {
    title: '22. Ley aplicable y resolución de controversias',
    paragraphs: [
      'Estos Términos se rigen por las leyes de la República de Costa Rica. Las partes se someten a los tribunales de San José, Costa Rica, renunciando a cualquier otro fuero, sin perjuicio de las normas de protección al consumidor que resulten imperativas.',
      'Previo a la vía judicial, las partes procurarán resolver sus diferencias de forma directa y, de no lograrlo, mediante conciliación conforme a la Ley N.° 7727 sobre Resolución Alterna de Conflictos y Promoción de la Paz Social.',
    ],
  },
  {
    title: '23. Contacto',
    paragraphs: [
      `Para consultas sobre estos Términos, ejercicio de derechos sobre datos personales o soporte, puede escribir a ${COMPANY.email}, comunicarse por WhatsApp al ${COMPANY.whatsapp} o enviarnos un mensaje en Instagram (${COMPANY.instagram}).`,
    ],
  },
]
