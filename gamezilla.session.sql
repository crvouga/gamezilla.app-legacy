INSERT INTO user_account (
            user_id,
            email_address,
            phone_number,
            phone_number_iso_3166_alpha_2
          )
          VALUES (
            ':user_id',
            ':email_address',
            ":phone_number",
            ':phone_number_iso_3166_alpha_2'
          )

DELETE FROM user_account WHERE email_address = ':email_address'

SELECT * FROM user_account
