const mockedBadges = [
  {
    _id: 3,
    name: 'Ajudante da Comunidade 3',
    description: 'Realizou dez ofertas no aplicativo',
    iconName: 'volunteer-activism',
    neededValue: 5,
    rank: 3,
    category: 'offer',
  },
  {
    _id: 2,
    name: 'Ajudante da Comunidade 2',
    description: 'Criou cinco ofertas no aplicativo',
    iconName: 'volunteer-activism',
    neededValue: 5,
    rank: 2,
    category: 'offer',
    nextBadge: 3,
  },
  {
    _id: 1,
    name: 'Ajudante da Comunidade 1',
    description: 'Criou uma oferta no aplicativo',
    iconName: 'volunteer-activism',
    neededValue: 1,
    rank: 1,
    category: 'offer',
    nextBadge: 2,
  },
  {
    _id: 6,
    name: 'Testador Beta 3',
    description: 'Paritcipou do beta do app',
    iconName: 'home',
    neededValue: 5,
    rank: 3,
    category: 'tester',
  },
  {
    _id: 5,
    name: 'Testador Beta 2',
    description: 'Paritcipou do beta do app',
    iconName: 'home',
    neededValue: 3,
    rank: 2,
    category: 'tester',
    nextBadge: 6,
  },
  {
    _id: 4,
    name: 'Testador Beta 1',
    description: 'Paritcipou do beta do app',
    iconName: 'home',
    neededValue: 1,
    rank: 1,
    category: 'tester',
    nextBadge: 5,
  },
];

module.exports = mockedBadges;