const router = require("express").Router();
const { User } = require("../../models");

router.post("/", async (req, res) => {
  try {
    const dbUserData = await User.create({
      username: req.body.username,
      password: req.body.password,
    });
    req.session.save(() => {
      req.session.userId = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.status(200).json(dbUserData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const dbUserData = await User.findOne({
      where: { username: req.body.username },
    });

    if (!dbUserData) {
      res.status(400).json({ message: "User account not found!" });
      return;
    }

    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect email or password please try again!" });
      return;
    }

    req.session.save(() => {
      req.session.userId = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: "Success your logged in!" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});


router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.delete("/user/:id", async (req, res) => {
  try {
    const dbUserData = await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!dbUserData) {
      res.status(404).json({ message: "User not found with this id" });
      return;
    }
    res.json(dbUserData);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;

