/* MFC Quiz — Prépa STAPS L1 & BPJEPS (contenu Premium)
   Même règle d'or que la banque principale : chaque question renvoie à une source vérifiable.
   Sources : OpenStax « Anatomy and Physiology 2e » (Rice University, licence CC BY 4.0), reformulé en français.
   Champs des questions : id (préfixe pp-), q, o (3 réponses), a (index de la bonne), e (explication), s (clé de source). */

window.MFC_PREPA_SOURCES = {
  osmi:  { t: 'OpenStax, Anatomy and Physiology 2e (2022), §8.4 Bones of the Lower Limb. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology/pages/8-4-bones-of-the-lower-limb' },
  musmi: { t: 'OpenStax, Anatomy and Physiology 2e (2022), §11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs' },
  artgen:{ t: 'OpenStax, Anatomy and Physiology 2e (2022), §9.6 Anatomy of Selected Synovial Joints (genou). Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints' },
  artrev:{ t: 'OpenStax, Anatomy and Physiology (2013), chapitre 9 Joints, Chapter Review (§9.4 Synovial Joints). Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology/pages/9-chapter-review' }
};

window.MFC_PREPA = {
  tracks: [
    { id: 'staps', name: 'STAPS L1', e: '🎓', desc: 'Le socle commun de 1re année : anatomie, physiologie, biomécanique…',
      subjects: [
        { id: 'anat', name: 'Anatomie', e: '🦴', desc: 'Os, muscles et articulations',
          chapters: [
            { id: 'anat-os-mi', t: 'Les os du membre inférieur', free: 1,
              k: ['Le membre inférieur compte 30 os : fémur, patella (rotule), tibia, fibula, 7 os du tarse, 5 métatarsiens et 14 phalanges.',
                  'Le fémur est l’os le plus long et le plus solide du corps. Son col est une zone de fracture fréquente.',
                  'La patella est un os sésamoïde logé dans le tendon du quadriceps. Elle ne s’articule qu’avec le fémur.',
                  'Dans la jambe, le tibia (côté médial) porte le poids du corps ; la fibula (côté latéral) sert surtout d’attache musculaire et forme la malléole latérale.'],
              qs: [
                { id: 'pp-os1', q: 'Combien d’os compte un membre inférieur ?', o: ['26', '30', '33'], a: 1, e: 'Fémur, patella, tibia, fibula, 7 os du tarse, 5 métatarsiens et 14 phalanges : 30 os au total.', s: 'osmi' },
                { id: 'pp-os2', q: 'Quel est l’os le plus long et le plus solide du corps ?', o: ['Le tibia', 'L’humérus', 'Le fémur'], a: 2, e: 'Le fémur, seul os de la cuisse, s’articule en haut avec l’os coxal (hanche) et en bas avec le tibia (genou).', s: 'osmi' },
                { id: 'pp-os3', q: 'La patella (rotule) est un os…', o: ['Sésamoïde, logé dans le tendon du quadriceps', 'Plat, comme les os du crâne', 'Court, comme les os du tarse'], a: 0, e: 'La patella se forme dans le tendon du quadriceps. Elle éloigne le tendon de l’articulation, ce qui augmente le bras de levier du quadriceps.', s: 'osmi' },
                { id: 'pp-os4', q: 'Avec quel(s) os la patella s’articule-t-elle ?', o: ['Le fémur et le tibia', 'Le fémur uniquement', 'Le tibia uniquement'], a: 1, e: 'La patella ne s’articule qu’avec la surface patellaire du fémur. Elle n’est pas en contact articulaire avec le tibia.', s: 'osmi' },
                { id: 'pp-os5', q: 'Quel os de la jambe porte le poids du corps ?', o: ['Le tibia', 'La fibula', 'Les deux à parts égales'], a: 0, e: 'Le tibia, côté médial, est l’os porteur. La fibula, fine et latérale, ne porte pas le poids et sert surtout d’attache aux muscles.', s: 'osmi' },
                { id: 'pp-os6', q: 'La malléole latérale (la bosse externe de la cheville) appartient à…', o: ['Au tibia', 'À la fibula', 'Au talus'], a: 1, e: 'L’extrémité distale de la fibula forme la malléole latérale. La malléole médiale, elle, appartient au tibia.', s: 'osmi' },
                { id: 'pp-os7', q: 'Quelle partie du fémur est une zone de fracture fréquente ?', o: ['La diaphyse', 'Les condyles', 'Le col du fémur'], a: 2, e: 'La zone rétrécie sous la tête fémorale, le col, est un site fréquent de fracture, notamment chez la personne âgée.', s: 'osmi' },
                { id: 'pp-os8', q: 'Où se situe la ligne âpre (linea aspera) ?', o: ['Sur la face postérieure de la diaphyse fémorale', 'Sur la face antérieure du tibia', 'Sur la fibula'], a: 0, e: 'Cette crête rugueuse court le long de la face postérieure du fémur. De nombreux muscles de la hanche et de la cuisse s’y attachent.', s: 'osmi' },
                { id: 'pp-os9', q: 'Combien d’os forment le tarse (l’arrière du pied) ?', o: ['5', '7', '14'], a: 1, e: 'Le tarse compte 7 os. Le médio-pied compte 5 métatarsiens et les orteils 14 phalanges.', s: 'osmi' },
                { id: 'pp-os10', q: 'Sur quelle structure se termine le tendon prolongeant le quadriceps (ligament patellaire) ?', o: ['La malléole médiale', 'La tubérosité tibiale', 'La tête de la fibula'], a: 1, e: 'La tubérosité tibiale, saillie antérieure en haut du tibia, est le point d’attache final du tendon associé à la patella.', s: 'osmi' }
              ] },
            { id: 'anat-mus-cuisse', t: 'Les muscles de la hanche et de la cuisse',
              k: ['Les fléchisseurs principaux de la hanche sont le psoas et l’iliaque (ensemble : l’ilio-psoas), qui se terminent sur le petit trochanter.',
                  'Le grand fessier étend la hanche ; il se termine sur la tubérosité glutéale du fémur et le tractus ilio-tibial.',
                  'Le quadriceps (4 chefs) étend le genou. Seul le droit fémoral, qui naît de l’épine iliaque antéro-inférieure, fléchit aussi la hanche.',
                  'Les ischio-jambiers (biceps fémoral, semi-tendineux, semi-membraneux) naissent de la tubérosité ischiatique : ils fléchissent le genou et étendent la hanche.'],
              qs: [
                { id: 'pp-mu1', q: 'Quels sont les principaux fléchisseurs de la hanche ?', o: ['Le psoas et l’iliaque (ilio-psoas)', 'Le grand et le moyen fessier', 'Les ischio-jambiers'], a: 0, e: 'Le grand psoas et l’iliaque forment le groupe ilio-psoas, principal fléchisseur de la hanche (lever le genou).', s: 'musmi' },
                { id: 'pp-mu2', q: 'Où se termine le grand psoas ?', o: ['Sur le grand trochanter', 'Sur le petit trochanter', 'Sur la ligne âpre'], a: 1, e: 'Le grand psoas naît des vertèbres T12 à L5 et se termine sur le petit trochanter du fémur.', s: 'musmi' },
                { id: 'pp-mu3', q: 'D’où naît le grand psoas ?', o: ['Des vertèbres lombaires (et de T12)', 'De la face interne de l’ilium', 'Du sacrum'], a: 0, e: 'Origine : vertèbres L1 à L5 et T12. C’est l’iliaque qui naît de la fosse iliaque.', s: 'musmi' },
                { id: 'pp-mu4', q: 'Quelle est l’action principale du grand fessier ?', o: ['La flexion de la hanche', 'L’extension de la hanche', 'L’adduction de la hanche'], a: 1, e: 'Le grand fessier ramène la cuisse vers l’arrière (extension), comme pour armer un tir ou se relever d’un squat.', s: 'musmi' },
                { id: 'pp-mu5', q: 'Où se termine le grand fessier ?', o: ['Sur le petit trochanter', 'Sur la tubérosité glutéale du fémur et le tractus ilio-tibial', 'Sur la tubérosité tibiale'], a: 1, e: 'Origine : face postérieure de l’ilium, sacrum et coccyx. Terminaison : tubérosité glutéale du fémur et tractus ilio-tibial.', s: 'musmi' },
                { id: 'pp-mu6', q: 'Combien de chefs compte le quadriceps fémoral ?', o: ['2', '3', '4'], a: 2, e: 'Droit fémoral, vaste latéral, vaste médial et vaste intermédiaire : 4 chefs qui étendent et stabilisent le genou.', s: 'musmi' },
                { id: 'pp-mu7', q: 'Quel chef du quadriceps fléchit aussi la hanche ?', o: ['Le droit fémoral', 'Le vaste latéral', 'Le vaste intermédiaire'], a: 0, e: 'Le droit fémoral croise la hanche et le genou (muscle bi-articulaire) : il étend le genou et fléchit la cuisse.', s: 'musmi' },
                { id: 'pp-mu8', q: 'D’où naît le droit fémoral ?', o: ['De l’épine iliaque antéro-supérieure', 'De l’épine iliaque antéro-inférieure et du bord de l’acétabulum', 'De la tubérosité ischiatique'], a: 1, e: 'Le droit fémoral naît de l’épine iliaque antéro-inférieure (et du bord supérieur de l’acétabulum). L’épine antéro-supérieure est l’origine du sartorius.', s: 'musmi' },
                { id: 'pp-mu9', q: 'Où se termine le quadriceps ?', o: ['Sur la patella puis la tubérosité tibiale', 'Sur la tête de la fibula', 'Sur le condyle médial du fémur'], a: 0, e: 'Les 4 chefs convergent vers la patella, puis le ligament patellaire se fixe sur la tubérosité tibiale.', s: 'musmi' },
                { id: 'pp-mu10', q: 'Quels muscles forment les ischio-jambiers ?', o: ['Droit fémoral, sartorius, gracile', 'Biceps fémoral, semi-tendineux, semi-membraneux', 'Grand, moyen et petit fessier'], a: 1, e: 'Ces trois longs muscles de la loge postérieure de la cuisse délimitent, par leurs tendons, le creux poplité.', s: 'musmi' },
                { id: 'pp-mu11', q: 'Quelle est l’origine commune des ischio-jambiers ?', o: ['La tubérosité ischiatique', 'Le grand trochanter', 'L’épine iliaque antéro-inférieure'], a: 0, e: 'Les trois ischio-jambiers naissent de la tubérosité ischiatique (le chef court du biceps fémoral naît, lui, du fémur).', s: 'musmi' },
                { id: 'pp-mu12', q: 'Quelle double action ont les ischio-jambiers ?', o: ['Extension du genou et flexion de la hanche', 'Flexion du genou et extension de la hanche', 'Abduction et rotation latérale de la hanche'], a: 1, e: 'Ils fléchissent la jambe sur la cuisse et étendent la cuisse, d’où leur rôle clé dans le sprint.', s: 'musmi' },
                { id: 'pp-mu13', q: 'Quelle est l’action principale du piriforme ?', o: ['Rotation latérale de la hanche', 'Flexion du genou', 'Adduction de la hanche'], a: 0, e: 'Le piriforme naît de la face antérolatérale du sacrum et se termine sur le grand trochanter : il tourne la cuisse vers l’extérieur et stabilise la hanche.', s: 'musmi' },
                { id: 'pp-mu14', q: 'Où se termine le gracile ?', o: ['Sur la tubérosité tibiale', 'Sur la face médiale du tibia', 'Sur la ligne âpre'], a: 1, e: 'Le gracile naît du pubis et se termine sur la face médiale du tibia. Il fléchit le genou et participe à l’adduction de la cuisse.', s: 'musmi' }
              ] },
            { id: 'anat-jambe', t: 'Jambe, cheville et pied',
              k: ['La jambe est divisée en 3 loges : antérieure, latérale et postérieure.',
                  'La loge antérieure assure surtout la flexion dorsale du pied ; la loge postérieure, la flexion plantaire.',
                  'La cheville (articulation talo-crurale) est une articulation en charnière : flexion dorsale et flexion plantaire.',
                  'Le pied possède des muscles intrinsèques : ceux du dos du pied étendent les orteils, ceux de la plante les fléchissent.'],
              qs: [
                { id: 'pp-ja1', q: 'Combien de loges musculaires compte la jambe ?', o: ['2', '3', '4'], a: 1, e: 'Les fascias profonds divisent la jambe en 3 loges : antérieure, latérale et postérieure.', s: 'musmi' },
                { id: 'pp-ja2', q: 'Quelle est la fonction principale des muscles de la loge antérieure de la jambe ?', o: ['La flexion plantaire', 'La flexion dorsale du pied', 'La flexion du genou'], a: 1, e: 'Les muscles de la loge antérieure relèvent la pointe du pied (flexion dorsale).', s: 'musmi' },
                { id: 'pp-ja3', q: 'Quelle est la fonction principale des muscles de la loge postérieure de la jambe ?', o: ['La flexion plantaire', 'La flexion dorsale', 'L’extension des orteils'], a: 0, e: 'La loge postérieure (dont le triceps sural) pousse la pointe du pied vers le bas : flexion plantaire, essentielle pour courir et sauter.', s: 'musmi' },
                { id: 'pp-ja4', q: 'Quel type d’articulation est la cheville ?', o: ['Une sphéroïde (énarthrose)', 'Une charnière', 'Une articulation en selle'], a: 1, e: 'Comme le coude ou le genou, la cheville est une charnière : elle permet surtout la flexion dorsale et la flexion plantaire.', s: 'artrev' },
                { id: 'pp-ja5', q: 'Que font en général les muscles intrinsèques de la plante du pied ?', o: ['Ils étendent les orteils', 'Ils fléchissent les orteils', 'Ils font tourner la jambe'], a: 1, e: 'Les muscles intrinsèques plantaires fléchissent les orteils ; ceux du dos du pied les étendent.', s: 'musmi' }
              ] },
            { id: 'anat-genou', t: 'Le genou : articulation et ligaments',
              k: ['Le genou est la plus grande articulation du corps. Il réunit 3 articulations : fémoro-patellaire et deux fémoro-tibiales (médiale et latérale).',
                  'Les ligaments collatéraux (tibial et fibulaire), à l’extérieur de la capsule, sont tendus en extension complète et empêchent les mouvements latéraux.',
                  'Les ligaments croisés antérieur (LCA) et postérieur (LCP) sont situés à l’intérieur de l’articulation.',
                  'Le quadriceps agit comme un « ligament dynamique » qui stabilise le genou.'],
              qs: [
                { id: 'pp-ge1', q: 'Quelle est la plus grande articulation du corps ?', o: ['La hanche', 'Le genou', 'L’épaule'], a: 1, e: 'Le genou est la plus grande articulation du corps. Il comprend en réalité trois articulations.', s: 'artgen' },
                { id: 'pp-ge2', q: 'Combien d’articulations le genou réunit-il ?', o: ['1', '2', '3'], a: 2, e: 'Fémoro-patellaire, fémoro-tibiale médiale et fémoro-tibiale latérale.', s: 'artgen' },
                { id: 'pp-ge3', q: 'Où sont situés les ligaments croisés (LCA et LCP) ?', o: ['À l’intérieur de l’articulation', 'À l’extérieur de la capsule, sur les côtés', 'Sous la patella'], a: 0, e: 'Les ligaments croisés antérieur et postérieur sont intra-articulaires (dans la capsule).', s: 'artgen' },
                { id: 'pp-ge4', q: 'Dans quelle position les ligaments collatéraux du genou sont-ils tendus ?', o: ['En flexion à 90°', 'En extension complète', 'En position accroupie'], a: 1, e: 'Genou tendu, les deux collatéraux sont tendus et empêchent les mouvements latéraux et rotatoires entre fémur et tibia.', s: 'artgen' },
                { id: 'pp-ge5', q: 'Quel muscle joue le rôle de « ligament dynamique » du genou ?', o: ['Les ischio-jambiers', 'Le quadriceps fémoral', 'Le gastrocnémien'], a: 1, e: 'Via la patella et le ligament patellaire, le quadriceps étend le genou et le stabilise activement.', s: 'artgen' },
                { id: 'pp-ge6', q: 'À quoi servent les ménisques (disques articulaires) ?', o: ['À amortir et guider les mouvements entre les os', 'À relier le muscle à l’os', 'À produire le liquide synovial'], a: 0, e: 'Un disque articulaire (ménisque) amortit, rend les mouvements plus fluides et renforce l’articulation.', s: 'artrev' }
              ] }
          ] },
        { id: 'physio', name: 'Physiologie', e: '❤️', desc: 'Cœur, respiration, énergie', soon: 1 },
        { id: 'biomeca', name: 'Biomécanique', e: '⚙️', desc: 'Forces, leviers, mouvement', soon: 1 },
        { id: 'psycho', name: 'Psychologie', e: '🧠', desc: 'Motivation, apprentissage moteur', soon: 1 },
        { id: 'socio', name: 'Sociologie & histoire du sport', e: '📜', desc: 'Le sport dans la société', soon: 1 }
      ] },
    { id: 'bpjeps', name: 'BPJEPS', e: '🏋️', desc: 'Les connaissances de fond et la préparation aux tests',
      subjects: [
        { id: 'anat', ref: 'staps', name: 'Anatomie fonctionnelle', e: '🦴', desc: 'Commun avec la prépa STAPS' },
        { id: 'secu', name: 'Sécurité & réglementation', e: '🛟', desc: 'Encadrer en sécurité', soon: 1 },
        { id: 'entr', name: 'Méthodologie de l’entraînement', e: '📈', desc: 'Planifier, doser, progresser', soon: 1 }
      ] }
  ]
};
