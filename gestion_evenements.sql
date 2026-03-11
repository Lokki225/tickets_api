-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 24 fév. 2026 à 16:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_evenements`
--

-- --------------------------------------------------------

--
-- Structure de la table `achatbillet`
--

CREATE TABLE `achatbillet` (
  `id` int(11) NOT NULL,
  `billetId` int(11) NOT NULL,
  `acheteurId` int(11) NOT NULL,
  `codeUnique` varchar(191) NOT NULL,
  `utilise` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `billet`
--

CREATE TABLE `billet` (
  `id` int(11) NOT NULL,
  `evenementId` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL,
  `typeId` int(11) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `vendus` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `campagne`
--

CREATE TABLE `campagne` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL,
  `contenu` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorieevenement`
--

CREATE TABLE `categorieevenement` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` int(11) NOT NULL,
  `organisateurId` int(11) NOT NULL,
  `categorieId` int(11) NOT NULL,
  `lieuId` int(11) NOT NULL,
  `statutId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `dateDebut` datetime(3) NOT NULL,
  `dateFin` datetime(3) NOT NULL,
  `maxBillets` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `lieuevenement`
--

CREATE TABLE `lieuevenement` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL,
  `adresse` varchar(191) NOT NULL,
  `ville` varchar(191) NOT NULL,
  `pays` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logaudit`
--

CREATE TABLE `logaudit` (
  `id` int(11) NOT NULL,
  `utilisateurId` int(11) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entite` varchar(191) NOT NULL,
  `entiteId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logsysteme`
--

CREATE TABLE `logsysteme` (
  `id` int(11) NOT NULL,
  `niveau` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `meta` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `expediteurId` int(11) NOT NULL,
  `destinataireId` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `utilisateurId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` int(11) NOT NULL,
  `achatBilletId` int(11) NOT NULL,
  `prestataireId` int(11) NOT NULL,
  `evenementId` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `statut` enum('EN_ATTENTE','SUCCES','ECHEC') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `prestatairepaiement`
--

CREATE TABLE `prestatairepaiement` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `profilutilisateur`
--

CREATE TABLE `profilutilisateur` (
  `id` int(11) NOT NULL,
  `utilisateurId` int(11) NOT NULL,
  `telephone` varchar(191) DEFAULT NULL,
  `adresse` varchar(191) DEFAULT NULL,
  `avatarUrl` varchar(191) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `programmeevenement`
--

CREATE TABLE `programmeevenement` (
  `id` int(11) NOT NULL,
  `evenementId` int(11) NOT NULL,
  `titre` varchar(191) NOT NULL,
  `heureDebut` datetime(3) NOT NULL,
  `heureFin` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reductionbillet`
--

CREATE TABLE `reductionbillet` (
  `id` int(11) NOT NULL,
  `billetId` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `expireLe` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `remboursement`
--

CREATE TABLE `remboursement` (
  `id` int(11) NOT NULL,
  `paiementId` int(11) NOT NULL,
  `raison` varchar(191) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `scanbillet`
--

CREATE TABLE `scanbillet` (
  `id` int(11) NOT NULL,
  `achatBilletId` int(11) NOT NULL,
  `proprietaireId` int(11) NOT NULL,
  `scanneurId` int(11) NOT NULL,
  `statutId` int(11) NOT NULL,
  `scanneLe` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statevenement`
--

CREATE TABLE `statevenement` (
  `id` int(11) NOT NULL,
  `evenementId` int(11) NOT NULL,
  `billetsVendus` int(11) NOT NULL,
  `revenu` decimal(12,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutevenement`
--

CREATE TABLE `statutevenement` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutilisateur`
--

CREATE TABLE `statutilisateur` (
  `id` int(11) NOT NULL,
  `utilisateurId` int(11) NOT NULL,
  `evenementsParticipes` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutscan`
--

CREATE TABLE `statutscan` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `typebillet`
--

CREATE TABLE `typebillet` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `motDePasse` varchar(191) NOT NULL,
  `roleId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('36079208-eaed-4fa8-9298-810294ee43b4', '707a23c7dc362f9a135f535752f848ea468906b47b5bde13ecfc66313bcdb233', '2026-02-24 13:54:45.505', '20260224135443_schema_complet_final', NULL, NULL, '2026-02-24 13:54:43.714', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `achatbillet`
--
ALTER TABLE `achatbillet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AchatBillet_codeUnique_key` (`codeUnique`),
  ADD KEY `AchatBillet_billetId_fkey` (`billetId`),
  ADD KEY `AchatBillet_acheteurId_fkey` (`acheteurId`);

--
-- Index pour la table `billet`
--
ALTER TABLE `billet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Billet_evenementId_fkey` (`evenementId`),
  ADD KEY `Billet_typeId_fkey` (`typeId`);

--
-- Index pour la table `campagne`
--
ALTER TABLE `campagne`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `categorieevenement`
--
ALTER TABLE `categorieevenement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CategorieEvenement_nom_key` (`nom`);

--
-- Index pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Evenement_organisateurId_fkey` (`organisateurId`),
  ADD KEY `Evenement_categorieId_fkey` (`categorieId`),
  ADD KEY `Evenement_lieuId_fkey` (`lieuId`),
  ADD KEY `Evenement_statutId_fkey` (`statutId`);

--
-- Index pour la table `lieuevenement`
--
ALTER TABLE `lieuevenement`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `logaudit`
--
ALTER TABLE `logaudit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LogAudit_utilisateurId_fkey` (`utilisateurId`);

--
-- Index pour la table `logsysteme`
--
ALTER TABLE `logsysteme`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Message_expediteurId_fkey` (`expediteurId`),
  ADD KEY `Message_destinataireId_fkey` (`destinataireId`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_utilisateurId_fkey` (`utilisateurId`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Paiement_achatBilletId_key` (`achatBilletId`),
  ADD KEY `Paiement_prestataireId_fkey` (`prestataireId`),
  ADD KEY `Paiement_evenementId_fkey` (`evenementId`);

--
-- Index pour la table `prestatairepaiement`
--
ALTER TABLE `prestatairepaiement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PrestatairePaiement_nom_key` (`nom`);

--
-- Index pour la table `profilutilisateur`
--
ALTER TABLE `profilutilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProfilUtilisateur_utilisateurId_key` (`utilisateurId`);

--
-- Index pour la table `programmeevenement`
--
ALTER TABLE `programmeevenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProgrammeEvenement_evenementId_fkey` (`evenementId`);

--
-- Index pour la table `reductionbillet`
--
ALTER TABLE `reductionbillet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ReductionBillet_code_key` (`code`),
  ADD KEY `ReductionBillet_billetId_fkey` (`billetId`);

--
-- Index pour la table `remboursement`
--
ALTER TABLE `remboursement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Remboursement_paiementId_fkey` (`paiementId`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_nom_key` (`nom`);

--
-- Index pour la table `scanbillet`
--
ALTER TABLE `scanbillet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ScanBillet_achatBilletId_fkey` (`achatBilletId`),
  ADD KEY `ScanBillet_proprietaireId_fkey` (`proprietaireId`),
  ADD KEY `ScanBillet_scanneurId_fkey` (`scanneurId`),
  ADD KEY `ScanBillet_statutId_fkey` (`statutId`);

--
-- Index pour la table `statevenement`
--
ALTER TABLE `statevenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StatEvenement_evenementId_fkey` (`evenementId`);

--
-- Index pour la table `statutevenement`
--
ALTER TABLE `statutevenement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StatutEvenement_nom_key` (`nom`);

--
-- Index pour la table `statutilisateur`
--
ALTER TABLE `statutilisateur`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StatUtilisateur_utilisateurId_fkey` (`utilisateurId`);

--
-- Index pour la table `statutscan`
--
ALTER TABLE `statutscan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StatutScan_nom_key` (`nom`);

--
-- Index pour la table `typebillet`
--
ALTER TABLE `typebillet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TypeBillet_nom_key` (`nom`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Utilisateur_email_key` (`email`),
  ADD KEY `Utilisateur_roleId_fkey` (`roleId`);

--
-- Index pour la table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `achatbillet`
--
ALTER TABLE `achatbillet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `billet`
--
ALTER TABLE `billet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `campagne`
--
ALTER TABLE `campagne`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categorieevenement`
--
ALTER TABLE `categorieevenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `evenement`
--
ALTER TABLE `evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `lieuevenement`
--
ALTER TABLE `lieuevenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `logaudit`
--
ALTER TABLE `logaudit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `logsysteme`
--
ALTER TABLE `logsysteme`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `prestatairepaiement`
--
ALTER TABLE `prestatairepaiement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `profilutilisateur`
--
ALTER TABLE `profilutilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `programmeevenement`
--
ALTER TABLE `programmeevenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reductionbillet`
--
ALTER TABLE `reductionbillet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `remboursement`
--
ALTER TABLE `remboursement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `scanbillet`
--
ALTER TABLE `scanbillet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `statevenement`
--
ALTER TABLE `statevenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `statutevenement`
--
ALTER TABLE `statutevenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `statutilisateur`
--
ALTER TABLE `statutilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `statutscan`
--
ALTER TABLE `statutscan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `typebillet`
--
ALTER TABLE `typebillet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `achatbillet`
--
ALTER TABLE `achatbillet`
  ADD CONSTRAINT `AchatBillet_acheteurId_fkey` FOREIGN KEY (`acheteurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `AchatBillet_billetId_fkey` FOREIGN KEY (`billetId`) REFERENCES `billet` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `billet`
--
ALTER TABLE `billet`
  ADD CONSTRAINT `Billet_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Billet_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `typebillet` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD CONSTRAINT `Evenement_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `categorieevenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_lieuId_fkey` FOREIGN KEY (`lieuId`) REFERENCES `lieuevenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_organisateurId_fkey` FOREIGN KEY (`organisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Evenement_statutId_fkey` FOREIGN KEY (`statutId`) REFERENCES `statutevenement` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `logaudit`
--
ALTER TABLE `logaudit`
  ADD CONSTRAINT `LogAudit_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `Message_destinataireId_fkey` FOREIGN KEY (`destinataireId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_expediteurId_fkey` FOREIGN KEY (`expediteurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `Paiement_achatBilletId_fkey` FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Paiement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Paiement_prestataireId_fkey` FOREIGN KEY (`prestataireId`) REFERENCES `prestatairepaiement` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `profilutilisateur`
--
ALTER TABLE `profilutilisateur`
  ADD CONSTRAINT `ProfilUtilisateur_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `programmeevenement`
--
ALTER TABLE `programmeevenement`
  ADD CONSTRAINT `ProgrammeEvenement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `reductionbillet`
--
ALTER TABLE `reductionbillet`
  ADD CONSTRAINT `ReductionBillet_billetId_fkey` FOREIGN KEY (`billetId`) REFERENCES `billet` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `remboursement`
--
ALTER TABLE `remboursement`
  ADD CONSTRAINT `Remboursement_paiementId_fkey` FOREIGN KEY (`paiementId`) REFERENCES `paiement` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `scanbillet`
--
ALTER TABLE `scanbillet`
  ADD CONSTRAINT `ScanBillet_achatBilletId_fkey` FOREIGN KEY (`achatBilletId`) REFERENCES `achatbillet` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_proprietaireId_fkey` FOREIGN KEY (`proprietaireId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_scanneurId_fkey` FOREIGN KEY (`scanneurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ScanBillet_statutId_fkey` FOREIGN KEY (`statutId`) REFERENCES `statutscan` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `statevenement`
--
ALTER TABLE `statevenement`
  ADD CONSTRAINT `StatEvenement_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `evenement` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `statutilisateur`
--
ALTER TABLE `statutilisateur`
  ADD CONSTRAINT `StatUtilisateur_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `Utilisateur_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
