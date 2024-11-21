const express = require('express');
const mongoose = require('mongoose');
const server = express();
const { readFile } = require('fs').promises;

// Configuração do Mongoose e variáveis de ambiente
require('dotenv').config();

const port = 8080;

// Nome do banco de dados
const dataBaseName = "receitasDB";

// Defina o esquema para a coleção
const receitaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: [String],
  descricao: String,
  media_avaliacoes: Number,
  modo_de_preparo: [String],
  subtitulo: String,
  tempo_de_preparo: Number,
  total_avaliacoes: Number,
  imagem: Buffer, // Se a imagem for binária, utilize Buffer
});

// Criando o modelo Receita
const Receita = mongoose.model('Receita', receitaSchema);

// Conectando ao MongoDB
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

// Configuração do EJS
server.set('view engine', 'ejs');
server.use(express.static('public'));

// Rota para listar todas as receitas
server.get('/', async (req, res) => {
  try {
    const receitas = await Receita.find(); // Busca todas as receitas no banco de dados
    res.render('index', { receitas }); // Renderiza a página index.ejs com as receitas
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    res.status(500).send("Erro ao carregar receitas.");
  }
});

// Endpoint para buscar receitas específicas
server.get('/receitas/:nome', async (req, res) => {
  try {
    const nomeReceita = req.params.nome.charAt(0).toUpperCase() + req.params.nome.slice(1);
    console.log(`Buscando receita: ${nomeReceita}`);

    // Buscar a receita no banco de dados
    const receita = await Receita.findOne({ nome: nomeReceita });

    if (!receita) {
      return res.status(404).send('Receita não encontrada.');
    }

    // Convertendo a imagem em formato base64 para exibição
    const receitaData = {
      ...receita.toObject(),
      imagem: `data:image/png;base64,${receita.imagem.toString('base64')}`,
    };

    res.render('recipe', { receita: receitaData }); // Renderiza a página recipe.ejs com os dados da receita
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).send('Erro ao carregar a receita.');
  }
});

// Página 404 para rotas inexistentes
server.use(async (req, res) => {
  res.status(404).send(await readFile('./404.html', 'utf8'));
});

// Inicialização do servidor
server.listen(process.env.PORT || port, () => console.log(`App disponível em http://localhost:${port}`));
