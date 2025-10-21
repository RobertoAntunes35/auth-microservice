// 
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend'

// 
import { UserModel } from '../model/user-model'
import { StatusCodes } from 'http-status-codes'
import { IResponse } from '../../../types/index'

// 
import dotenv from 'dotenv'
import { UserException } from '../../exception/user-excepetion'




class EmailService {

  public async sendEmail(user: UserModel, code: string): Promise<IResponse> {
    try {

      dotenv.config();

      const secretKey = process.env.SECRET_KEY_MAILERSEND;
      if (!secretKey) throw new UserException("API KEY MAILERSEND NOT FOUND", StatusCodes.BAD_REQUEST);
      const mailersend =  new MailerSend({
          apiKey: secretKey
      })

      const recipients = [new Recipient(user.email, user.name)];

      const emailParams = new EmailParams()
      .setFrom(new Sender("suporte@supply-hub.org"))
      .setTo(recipients)
      .setSubject("Código de acesso")
      .setHtml(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Código de Verificação</title>
</head>
<body style="margin:0; padding:0; background-color:#f2f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td align="center" style="background-color:#4a90e2; padding: 30px;">
              <h1 style="margin:0; font-size: 28px; color: #ffffff;">Verificação de Segurança</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 18px; color: #333333;">Olá!</p>
              <p style="font-size: 16px; color: #555555; margin-top: 10px;">
                Use o código abaixo para confirmar sua identidade e continuar com o processo:
              </p>
              <div style="margin: 30px auto; background-color: #f0f4ff; padding: 20px 40px; border-radius: 10px; display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4a90e2;">
                ${code}
              </div>
              <p style="font-size: 14px; color: #999999; margin-top: 20px;">
                Este código expira em 10 minutos. Se você não solicitou esta verificação, ignore este e-mail.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9f9f9; padding: 20px; text-align: center; font-size: 12px; color:#bbbbbb;">
              &copy; 2025 Supply Hub. Todos os direitos reservados.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`)
      .setText(code)

      await mailersend.email.send(emailParams)

      return {
          status: StatusCodes.OK,
          message: `O código de login foi encaminhado com sucesso para: ${user.email}.`,
      }
  
  } catch (err: any) {
      console.error(err);
      throw new UserException(`Erro ao encaminhar email para ${user.email}. Detalhes: ${err.message}`, err.status || 500);
      // return {
      //     status: err.status ? err.status : 500,
      //     message: `Erro ao encaminhar email para: ${user.email}. Error: `,
      // }
  }
  }

}




export default new EmailService();