-- Compatible SQL Dump for DB Browser and standard MySQL
-- Removes datetime(3) precision for better compatibility

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------

--
-- Structure de la table `achatbillet`
--

CREATE TABLE `achatbillet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `billetId` int(11) NOT NULL,
  `acheteurId` int(11) NOT NULL,
  `codeUnique` varchar(191) NOT NULL,
  `utilise` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AchatBillet_codeUnique_key` (`codeUnique`),
  KEY `AchatBillet_billetId_fkey` (`billetId`),
  KEY `AchatBillet_acheteurId_fkey` (`acheteurId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `billet`
--

CREATE TABLE `billet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenementId` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL,
  `typeId` int(11) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `vendus` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  KEY `Billet_evenementId_fkey` (`evenementId`),
  KEY `Billet_typeId_fkey` (`typeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `campagne`
--

CREATE TABLE `campagne` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  `contenu` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorieevenement`
--

CREATE TABLE `categorieevenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CategorieEvenement_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organisateurId` int(11) NOT NULL,
  `categorieId` int(11) NOT NULL,
  `lieuId` int(11) NOT NULL,
  `statutId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `dateDebut` datetime NOT NULL,
  `dateFin` datetime NOT NULL,
  `maxBillets` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  KEY `Evenement_organisateurId_fkey` (`organisateurId`),
  KEY `Evenement_categorieId_fkey` (`categorieId`),
  KEY `Evenement_lieuId_fkey` (`lieuId`),
  KEY `Evenement_statutId_fkey` (`statutId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `lieuevenement`
--

CREATE TABLE `lieuevenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  `adresse` varchar(191) NOT NULL,
  `ville` varchar(191) NOT NULL,
  `pays` varchar(191) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logaudit`
--

CREATE TABLE `logaudit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateurId` int(11) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entite` varchar(191) NOT NULL,
  `entiteId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `LogAudit_utilisateurId_fkey` (`utilisateurId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logsysteme`
--

CREATE TABLE `logsysteme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `niveau` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `meta` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expediteurId` int(11) NOT NULL,
  `destinataireId` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `Message_expediteurId_fkey` (`expediteurId`),
  KEY `Message_destinataireId_fkey` (`destinataireId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateurId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `Notification_utilisateurId_fkey` (`utilisateurId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `achatBilletId` int(11) NOT NULL,
  `prestataireId` int(11) NOT NULL,
  `evenementId` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `statut` enum('EN_ATTENTE','SUCCES','ECHEC') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Paiement_achatBilletId_key` (`achatBilletId`),
  KEY `Paiement_prestataireId_fkey` (`prestataireId`),
  KEY `Paiement_evenementId_fkey` (`evenementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `prestatairepaiement`
--

CREATE TABLE `prestatairepaiement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PrestatairePaiement_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `profilutilisateur`
--

CREATE TABLE `profilutilisateur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateurId` int(11) NOT NULL,
  `telephone` varchar(191) DEFAULT NULL,
  `adresse` varchar(191) DEFAULT NULL,
  `avatarUrl` varchar(191) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProfilUtilisateur_utilisateurId_key` (`utilisateurId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `programmeevenement`
--

CREATE TABLE `programmeevenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenementId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `heureDebut` datetime NOT NULL,
  `heureFin` datetime NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  KEY `ProgrammeEvenement_evenementId_fkey` (`evenementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reductionbillet`
--

CREATE TABLE `reductionbillet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `billetId` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `expireLe` datetime NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ReductionBillet_code_key` (`code`),
  KEY `ReductionBillet_billetId_fkey` (`billetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `remboursement`
--

CREATE TABLE `remboursement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paiementId` int(11) NOT NULL,
  `raison` varchar(191) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `Remboursement_paiementId_fkey` (`paiementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `scanbillet`
--

CREATE TABLE `scanbillet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `achatBilletId` int(11) NOT NULL,
  `proprietaireId` int(11) NOT NULL,
  `scanneurId` int(11) NOT NULL,
  `statutId` int(11) NOT NULL,
  `scanneLe` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `ScanBillet_achatBilletId_fkey` (`achatBilletId`),
  KEY `ScanBillet_proprietaireId_fkey` (`proprietaireId`),
  KEY `ScanBillet_scanneurId_fkey` (`scanneurId`),
  KEY `ScanBillet_statutId_fkey` (`statutId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statevenement`
--

CREATE TABLE `statevenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenementId` int(11) NOT NULL,
  `billetsVendus` int(11) NOT NULL,
  `revenu` decimal(12,2) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `StatEvenement_evenementId_fkey` (`evenementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutevenement`
--

CREATE TABLE `statutevenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StatutEvenement_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutilisateur`
--

CREATE TABLE `statutilisateur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateurId` int(11) NOT NULL,
  `evenementsParticipes` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`),
  KEY `StatUtilisateur_utilisateurId_fkey` (`utilisateurId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutscan`
--

CREATE TABLE `statutscan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StatutScan_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `typebillet`
--

CREATE TABLE `typebillet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TypeBillet_nom_key` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `motDePasse` varchar(191) NOT NULL,
  `roleId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Utilisateur_email_key` (`email`),
  KEY `Utilisateur_roleId_fkey` (`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT current_timestamp,
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Add foreign key constraints
--

ALTER TABLE `achatbillet`
  ADD CONSTRAINT `AchatBillet_acheteurId_fkey` FOREIGN KEY (`acheteurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `AchatBillet_billetId_fkey` FOREIGN KEY (`billetId`) REFERENCES `billet` (`id`) ON UPDATE CASCADE;

ALTER TABLE `billet`
  ADD CONSTRAINT `Billet_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Billet_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `typebillet` (`id`) ON UPDATE CASCADE;

ALTER TABLE `evenement`
  ADD CONSTRAINT `Evenement_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `categorieevenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_lieuId_fkey` FOREIGN KEY (`lieuId`) REFERENCES `lieuevenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_organisateurId_fkey` FOREIGN KEY (`organisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_statutId_fkey` FOREIGN KEY (`statutId`) REFERENCES `statutevenement` (`id`) ON UPDATE CASCADE;

ALTER TABLE `logaudit`
  ADD CONSTRAINT `LogAudit_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `message`
  ADD CONSTRAINT `Message_destinataireId_fkey` FOREIGN KEY (`destinataireId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_expediteurId_fkey` FOREIGN KEY (`expediteurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

ALTER TABLE `paiement`
  ADD CONSTRAINT `Paiement_achatBilletId_fkey` FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Paiement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Paiement_prestataireId_fkey` FOREIGN KEY (`prestataireId`) REFERENCES `prestatairepaiement` (`id`) ON UPDATE CASCADE;

ALTER TABLE `profilutilisateur`
  ADD CONSTRAINT `ProfilUtilisateur_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `programmeevenement`
  ADD CONSTRAINT `ProgrammeEvenement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE;

ALTER TABLE `reductionbillet`
  ADD CONSTRAINT `ReductionBillet_billetId_fkey` FOREIGN KEY (`billetId`) REFERENCES `billet` (`id`) ON UPDATE CASCADE;

ALTER TABLE `remboursement`
  ADD CONSTRAINT `Remboursement_paiementId_fkey` FOREIGN KEY (`paiementId`) REFERENCES `paiement` (`id`) ON UPDATE CASCADE;

ALTER TABLE `scanbillet`
  ADD CONSTRAINT `ScanBillet_achatBilletId_fkey` FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_proprietaireId_fkey` FOREIGN KEY (`proprietaireId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_scanneurId_fkey` FOREIGN KEY (`scanneurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_statutId_fkey` FOREIGN KEY (`statutId`) REFERENCES `statutscan` (`id`) ON UPDATE CASCADE;

ALTER TABLE `statevenement`
  ADD CONSTRAINT `StatEvenement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE;

ALTER TABLE `statutilisateur`
  ADD CONSTRAINT `StatUtilisateur_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

ALTER TABLE `utilisateur`
  ADD CONSTRAINT `Utilisateur_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

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
