const express = require('express');
const mongoose = require('mongoose');
const server = express();
const { readFile } = require('fs').promises;
const dataBaseName = "receitasDB";

// Configuração do Mongoose e variáveis de ambiente
require('dotenv').config();

const port = 8080;

const receitaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: [String],
  descricao: String,
  media_avaliacoes: Number,
  modo_de_preparo: [String],
  subtitulo: String,
  tempo_de_preparo: Number,
  total_avaliacoes: Number,
  imagem: Buffer, 
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
    res.status(500).send("Erro ao carregar receitas."); // envia mensagem de erro que é exibida na tela 
  }
});

// Endpoint para buscar receitas que aparecem na tela 
server.get('/receitas/:nome', async (req, res) => {
    try {
      const nomeReceita = req.params.nome.charAt(0).toUpperCase() + req.params.nome.slice(1);
      console.log(`Buscando receita com nome: ${nomeReceita}`);
  
      const receita = await Receita.findOne({ nome: nomeReceita });
  
      if (!receita) {
        return res.status(404).send('Receita não encontrada.');
      }
  
      const receitaData = {
        nome: receita.nome || "Nome não disponível",
        ingredientes: receita.ingredientes || [],
        descricao: receita.descricao || "Descrição não disponível",
        media_avaliacoes: receita.media_avaliacoes || 0,
        modo_de_preparo: receita.modo_de_preparo || [],
        subtitulo: receita.subtitulo || "Subtítulo não disponível",
        tempo_de_preparo: receita.tempo_de_preparo || 0,
        total_avaliacoes: receita.total_avaliacoes || 0,
        imagem: receita.imagem
          ? receita.imagem = "data:image/svg+xml;base64, " + receita.imagem
          : null,
      };
  
      res.render('recipe', { receita: receitaData });
    } catch (error) {
      console.error(`Erro ao buscar a receita "${req.params.nome}":`, error);
      res.status(500).send('Erro ao carregar a receita.');
    }
  });
  

// Página 404 para rotas inexistentes
server.use(async (req, res) => {
  res.status(404).send(await readFile('./404.html', 'utf8'));
});

// Inicialização do servidor
server.listen(process.env.PORT || port, () => console.log(`App disponível em http://localhost:${port}`));
