//database setup -------------------------------
const Sequelize = require('sequelize');
const { STRING } = require('sequelize');
const db = new Sequelize('postgres://localhost/dealers_choice_sequelize');

//models
const Owner = db.define('owner', {
  name: { type: STRING, unique: true },
});
const Pet = db.define('pet', {
  name: { type: STRING, unique: true },
  species: STRING,
});

Pet.belongsTo(Owner);
Owner.hasMany(Pet);

const syncAndSeed = async () => {
  try {
    const lisa = await Owner.create({ name: 'Lisa' });
    const vj = await Owner.create({ name: 'VJ' });
    const sarah = await Owner.create({ name: 'Sarah' });
    const emily = await Owner.create({ name: 'Emily' });
    const jeanMichel = await Pet.create({
      name: 'Jean-Michel',
      species: 'cat',
      ownerId: lisa.id,
    });
    await Pet.create({ name: 'Topper', species: 'cat', ownerId: vj.id });
    await Pet.create({ name: 'Jingle', species: 'cat', ownerId: vj.id });
    await Pet.create({ name: 'Keira', species: 'dog', ownerId: sarah.id });
  } catch (error) {
    console.log(error);
  }
};

//Router setup ------------------------------
const express = require('express');
const { type } = require('express/lib/response');
const app = express();

const init = async () => {
  try {
    await db.sync({ force: true });
    await syncAndSeed();
    console.log('~~~~~~~~~~~~synced~~~~~~~~~~~~~');
    const andre = process.env.PORT || 3000;
    app.listen(andre, () => {
      console.log(`listening to andre ${andre}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();

//routes -------------------------
app.get('/', (req, res) => {
  res.redirect('/pets');
});

app.get('/pets', async (req, res, next) => {
  try {
    const pets = await Pet.findAll({ include: [Owner] });
    const html = `
    <html>
      <h1>Pets</h1>
      <ul>
        ${pets
          .map((x) => {
            return `<li>${x.name}, ${x.species}</li>`;
          })
          .join('')}
      </ul>
    </html>
    `;
    res.send(html);
  } catch (error) {
    next(error);
  }
});
