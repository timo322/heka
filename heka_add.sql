-- champ email et password
ALTER TABLE Utilisateur_
ADD COLUMN email VARCHAR(100),
ADD COLUMN mot_de_passe VARCHAR(100);

-- ajouter utilisateurs
UPDATE Utilisateur_
SET email = 'alice@heka.fr', mot_de_passe = 'patient123'
WHERE ID = 'U001';

UPDATE Utilisateur_
SET email = 'pharma@heka.fr', mot_de_passe = 'pharma123'
WHERE ID = 'U002';

UPDATE Utilisateur_
SET email = 'livreur@heka.fr', mot_de_passe = 'livreur123'
WHERE ID = 'U003';
