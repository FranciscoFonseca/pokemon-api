const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const pokemonSeedData = require('./pokemonData.js');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ffonseca',
    password: 'password',
    database: 'pokemonDB',
});

const userSeedData = [{
        name: 'Ash',
        password: 'Password123',
        email: 'campeon_pueblo_paleta@yopmail.com',
        team: "[{\"id\":1,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]},{\"id\":4,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]},{\"id\":7,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]}]"
    },
    {
        name: 'Gary',
        password: 'Password123',
        email: 'algunos_me_dicen_blue@yopmail.com',
        team: "[{\"id\":1,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]},{\"id\":4,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]},{\"id\":7,\"experience\":0,\"level\":1,\"attacks\":[1,2,3,4]}]"
    },
];


connection.connect((err) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Connected to the MySQL server');

    userSeedData.forEach(async (user) => {
        user.password = await bcrypt.hash(user.password, 8)
        connection.query('INSERT INTO user SET ?', user, (error) => {
            if (error) {
                console.error(error);
                return;
            }
        });
    });
    pokemonSeedData.forEach((pokemon,index) => {
        connection.query('INSERT INTO pokemon SET ?', pokemon, (error) => {
            if (error) {
                console.error(error);
                return;
            }
            if (index === pokemonSeedData.length - 1) {
              // Close the connection after the last hobby has been inserted
              connection.end((closeError) => {
                  if (closeError) {
                      console.error(closeError);
                      return;
                  }

                  console.log('Connection closed');
              });
          }
        });

        
    });


});