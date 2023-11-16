function emailVerification() {
  return `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificação</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #F3F3F3;
      }
  
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        position: relative;
      }
  
      h2 {
        font-family: 'Dela Gothic One', sans-serif;
        color: #2B2700;
        font-weight: 600;
        text-align: center;
      }
  
      p {
        color: #2B2700;
        font-size: 22px;
      }
  
      .verification-code {
        display: inline-block;
        font-size: 24px;
        font-weight: bold;
        padding: 10px;
        background-color: #FE601F;
        color: #fff;
        border-radius: 5px;
      }
  
      .note {
        color: #999;
        font-size: 14px;
      }

      .thanks {
        font-size: 14px;
      }
  
      .header-bar, .footer-bar {
        height: 10px;
        background-color: #215A36;
        border-radius: 5px;
        position: absolute;
        left: 0;
        right: 0;
      }
  
      .header-bar {
        top: 0;
      }
  
      .footer-bar {
        bottom: 0;
      }
  
      @media screen and (max-width: 600px) {
        .container {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header-bar"></div>
      <h2>Código de verificação</h2>
      <p>Olá, esse é seu código de verificação para confirmar seu email no site do CUJA: </p>
      <span class="verification-code">{VERIFICATION_CODE}</span>
      <p class="note">
        Este código expirará em 15 minutos.
        Código é de uso pessoal e garante sua segurança em nosso site, por isso, não o compartilhe com ninguém.
      <p class="thanks">Atenciosamente,<br>CUJA Digital</p>
      <div class="footer-bar"></div>
    </div>
  </body>
  </html>`;
}

export default Object.freeze({
  emailVerification,
});
