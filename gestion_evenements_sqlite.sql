-- SQLite Compatible SQL Dump
-- For DB Browser for SQLite

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------

--
-- Structure de la table `achatbillet`
--

CREATE TABLE `achatbillet` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `billetId` INTEGER NOT NULL,
  `acheteurId` INTEGER NOT NULL,
  `codeUnique` TEXT NOT NULL UNIQUE,
  `utilise` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`billetId`) REFERENCES `billet`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`acheteurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `billet`
--

CREATE TABLE `billet` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `evenementId` INTEGER NOT NULL,
  `nom` TEXT NOT NULL,
  `typeId` INTEGER NOT NULL,
  `prix` REAL NOT NULL,
  `quantite` INTEGER NOT NULL,
  `vendus` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`evenementId`) REFERENCES `evenement`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`typeId`) REFERENCES `typebillet`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `campagne`
--

CREATE TABLE `campagne` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL,
  `contenu` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Structure de la table `categorieevenement`
--

CREATE TABLE `categorieevenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `organisateurId` INTEGER NOT NULL,
  `categorieId` INTEGER NOT NULL,
  `lieuId` INTEGER NOT NULL,
  `statutId` INTEGER NOT NULL,
  `titre` TEXT NOT NULL,
  `description` TEXT,
  `dateDebut` DATETIME NOT NULL,
  `dateFin` DATETIME NOT NULL,
  `maxBillets` INTEGER NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organisateurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`categorieId`) REFERENCES `categorieevenement`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`lieuId`) REFERENCES `lieuevenement`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`statutId`) REFERENCES `statutevenement`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `lieuevenement`
--

CREATE TABLE `lieuevenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL,
  `adresse` TEXT NOT NULL,
  `ville` TEXT NOT NULL,
  `pays` TEXT NOT NULL
);

-- --------------------------------------------------------

--
-- Structure de la table `logaudit`
--

CREATE TABLE `logaudit` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `utilisateurId` INTEGER,
  `action` TEXT NOT NULL,
  `entite` TEXT NOT NULL,
  `entiteId` INTEGER NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `logsysteme`
--

CREATE TABLE `logsysteme` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `niveau` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `meta` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Structure de la table `message`
--

CREATE TABLE `message` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `expediteurId` INTEGER NOT NULL,
  `destinataireId` INTEGER NOT NULL,
  `contenu` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`expediteurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`destinataireId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `utilisateurId` INTEGER NOT NULL,
  `titre` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `lu` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `achatBilletId` INTEGER NOT NULL UNIQUE,
  `prestataireId` INTEGER NOT NULL,
  `evenementId` INTEGER NOT NULL,
  `montant` REAL NOT NULL,
  `reference` TEXT NOT NULL,
  `statut` TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (`statut` IN ('EN_ATTENTE','SUCCES','ECHEC')),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`prestataireId`) REFERENCES `prestatairepaiement`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`evenementId`) REFERENCES `evenement`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `prestatairepaiement`
--

CREATE TABLE `prestatairepaiement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `profilutilisateur`
--

CREATE TABLE `profilutilisateur` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `utilisateurId` INTEGER NOT NULL UNIQUE,
  `telephone` TEXT,
  `adresse` TEXT,
  `avatarUrl` TEXT,
  `bio` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `programmeevenement`
--

CREATE TABLE `programmeevenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `evenementId` INTEGER NOT NULL,
  `titre` TEXT NOT NULL,
  `heureDebut` DATETIME NOT NULL,
  `heureFin` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`evenementId`) REFERENCES `evenement`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `reductionbillet`
--

CREATE TABLE `reductionbillet` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `billetId` INTEGER NOT NULL,
  `code` TEXT NOT NULL UNIQUE,
  `montant` REAL NOT NULL,
  `expireLe` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`billetId`) REFERENCES `billet`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `remboursement`
--

CREATE TABLE `remboursement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `paiementId` INTEGER NOT NULL,
  `raison` TEXT NOT NULL,
  `montant` REAL NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`paiementId`) REFERENCES `paiement`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `scanbillet`
--

CREATE TABLE `scanbillet` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `achatBilletId` INTEGER NOT NULL,
  `proprietaireId` INTEGER NOT NULL,
  `scanneurId` INTEGER NOT NULL,
  `statutId` INTEGER NOT NULL,
  `scanneLe` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`proprietaireId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`scanneurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`statutId`) REFERENCES `statutscan`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `statevenement`
--

CREATE TABLE `statevenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `evenementId` INTEGER NOT NULL,
  `billetsVendus` INTEGER NOT NULL,
  `revenu` REAL NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`evenementId`) REFERENCES `evenement`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `statutevenement`
--

CREATE TABLE `statutevenement` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `statutilisateur`
--

CREATE TABLE `statutilisateur` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `utilisateurId` INTEGER NOT NULL,
  `evenementsParticipes` INTEGER NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `statutscan`
--

CREATE TABLE `statutscan` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `typebillet`
--

CREATE TABLE `typebillet` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` TEXT NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `motDePasse` TEXT NOT NULL,
  `roleId` INTEGER NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON UPDATE CASCADE
);

-- --------------------------------------------------------

--
-- Structure de la table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` TEXT PRIMARY KEY,
  `checksum` TEXT NOT NULL,
  `finished_at` DATETIME,
  `migration_name` TEXT NOT NULL,
  `logs` TEXT,
  `rolled_back_at` DATETIME,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_steps_count` INTEGER NOT NULL DEFAULT 0
);

--
-- Insert basic data
--

INSERT INTO `role` (`nom`) VALUES
('ADMIN'),
('ORGANIZER'),
('USER'),
('SCANNER');

INSERT INTO `statutevenement` (`nom`) VALUES
('DRAFT'),
('PUBLISHED'),
('CANCELLED'),
('COMPLETED');

INSERT INTO `statutscan` (`nom`) VALUES
('VALID'),
('INVALID'),
('ALREADY_USED');

INSERT INTO `typebillet` (`nom`) VALUES
('VIP'),
('REGULAR'),
('STUDENT'),
('EARLY_BIRD');

INSERT INTO `categorieevenement` (`nom`) VALUES
('CONCERT'),
('CONFERENCE'),
('SPORT'),
('THEATER'),
('FESTIVAL');

INSERT INTO `prestatairepaiement` (`nom`) VALUES
('STRIPE'),
('PAYPAL'),
('CREDIT_CARD'),
('BANK_TRANSFER');
