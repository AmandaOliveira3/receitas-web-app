const express = require('express');
const { MongoClient } = require('mongodb');
const server = express();
const { readFile } = require('fs').promises;
const ejs = require('ejs');

require('dotenv').config();


console.log(process.env);  // Verifique todas as variáveis carregadas

const port = 8080;
console.log(process.env.URI);
const client = new MongoClient(process.env.URI);
const dataBaseName = "recipe_site";
const collectionName = "recipes";


/* -------------------teste ------------------------*/
// const mongoose = require('mongoose');

// // Conectar ao MongoDB
// mongoose.connect('mongodb://localhost:27017/receitasDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'Erro de conexão:'));
// db.once('open', () => {
//   console.log('Conectado ao MongoDB com sucesso!');
// });

// const receitaSchema = new mongoose.Schema({
//     nome: String,
//     ingredientes: [String],
//     modoPreparo: String,
//     tempoPreparo: String,
//   });
  
//   const Receita = mongoose.model('Receita', receitaSchema);

  
//   app.get('/', async (req, res) => {
//     try {
//       const receitas = await Receita.find();
//       res.render('index', { receitas });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Erro ao carregar receitas.');
//     }
//   });
//   app.get('/receita/:nome', async (req, res) => {
//     try {
//       const receita = await Receita.findOne({ nome: req.params.nome });
//       if (receita) {
//         res.render('receita', { receita });
//       } else {
//         res.status(404).send('Receita não encontrada.');
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Erro ao carregar a receita.');
//     }
//   });
    

/* -------------------teste ------------------------*/


server.set('view engine', 'ejs');

server.use(express.static('public'));

server.get('/', async (request, response) => {
    response.send(await readFile('./index.html', 'utf8'));
});

/*---------------------teste----------*/

server.get('/', async (request, response) => {
    try {
        const receitas = await client.db(dataBaseName).collection(collectionName).find().toArray();
        response.render('index', { receitas });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erro ao carregar as receitas.');
    }
});

/*---------------------teste----------*/


server.get('/receitas*', async (request, response) => {
    const name = request.path.split("/").pop();
    upperName = name.charAt(0).toUpperCase() + name.slice(1);
    data = await client.db(dataBaseName).collection(collectionName).findOne({ nome: upperName });
    data.imagem = "data:image/svg+xml;base64, " + data.imagem;
    response.render('recipe', data);
});

server.use(async (request, response) => {
    response.status(404).send(await readFile('./404.html', 'utf8'));
});

server.listen(process.env.PORT || port, () => console.log(`App available on http://localhost:${port}`));

