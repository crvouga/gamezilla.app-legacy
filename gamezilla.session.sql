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

DELETE FROM user_account WHERE user_id = ':user_id'
SELECT * FROM user_account WHERE user_id = ':user_id' LIMIT 1
