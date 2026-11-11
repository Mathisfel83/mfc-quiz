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

/* ===== Anatomie — extension v2 : QCM à 4 choix + Vrai/Faux (vf:1, o = ['Vrai','Faux']) ===== */
Object.assign(window.MFC_PREPA_SOURCES, {
  mouv:  { t: 'OpenStax, Anatomy and Physiology (2013), §9.5 Types of Body Movements. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology/pages/9-5-types-of-body-movements' },
  osms:  { t: 'OpenStax, Anatomy and Physiology 2e (2022), §8.2 Bones of the Upper Limb. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb' },
  musms: { t: 'OpenStax, Anatomy and Physiology (2013), §11.5 Muscles of the Pectoral Girdle and Upper Limbs. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs' },
  rachis:{ t: 'OpenStax, Anatomy and Physiology (2013), §7.3 The Vertebral Column. Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology/pages/7-3-the-vertebral-column' },
  art96: { t: 'OpenStax, Anatomy and Physiology 2e (2022), §9.6 Anatomy of Selected Synovial Joints (épaule, coude, hanche, genou, cheville). Rice University, CC BY 4.0.', u: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints' }
});
(function(){
  var VF = ['Vrai', 'Faux'];
  var anat = window.MFC_PREPA.tracks[0].subjects.filter(function(s){ return s.id === 'anat'; })[0];
  function ch(id){ return anat.chapters.filter(function(c){ return c.id === id; })[0]; }

  /* --- compléments des chapitres existants --- */
  ch('anat-os-mi').qs.push(
    { id: 'pp-os11', vf: 1, q: 'La fibula porte l’essentiel du poids du corps.', o: VF, a: 1, e: 'Faux. C’est le tibia, côté médial, qui porte le poids. La fibula, fine et latérale, sert surtout d’attache musculaire.', s: 'osmi' },
    { id: 'pp-os12', vf: 1, q: 'La patella s’articule à la fois avec le fémur et avec le tibia.', o: VF, a: 1, e: 'Faux. La patella ne s’articule qu’avec le fémur (surface patellaire). Elle est reliée au tibia par le ligament patellaire, sans articulation.', s: 'osmi' },
    { id: 'pp-os13', q: 'Combien de phalanges compte un pied ?', o: ['5', '10', '14', '19'], a: 2, e: 'Les orteils comptent 14 phalanges : 2 pour le gros orteil, 3 pour chacun des 4 autres.', s: 'osmi' }
  );
  ch('anat-mus-cuisse').qs.push(
    { id: 'pp-mu15', vf: 1, q: 'Parmi les 4 chefs du quadriceps, seul le droit fémoral croise aussi la hanche.', o: VF, a: 0, e: 'Vrai. Le droit fémoral naît du bassin (épine iliaque antéro-inférieure) : il étend le genou et fléchit la hanche. Les 3 vastes naissent du fémur.', s: 'musmi' },
    { id: 'pp-mu16', vf: 1, q: 'Les ischio-jambiers naissent du grand trochanter.', o: VF, a: 1, e: 'Faux. Leur origine commune est la tubérosité ischiatique, sur le bassin.', s: 'musmi' },
    { id: 'pp-mu17', vf: 1, q: 'Le grand psoas se termine sur le petit trochanter du fémur.', o: VF, a: 0, e: 'Vrai. Avec l’iliaque, il forme l’ilio-psoas, principal fléchisseur de la hanche.', s: 'musmi' }
  );
  ch('anat-jambe').qs.push(
    { id: 'pp-ja6', vf: 1, q: 'La cheville (articulation talo-crurale) est une articulation en charnière.', o: VF, a: 0, e: 'Vrai. Elle permet surtout la flexion dorsale et la flexion plantaire.', s: 'musmi' },
    { id: 'pp-ja7', vf: 1, q: 'Les muscles de la loge antérieure de la jambe assurent surtout la flexion plantaire.', o: VF, a: 1, e: 'Faux. La loge antérieure relève le pied (flexion dorsale). C’est la loge postérieure qui assure la flexion plantaire.', s: 'musmi' }
  );
  ch('anat-genou').qs.push(
    { id: 'pp-ge7', vf: 1, q: 'Le ménisque médial se blesse beaucoup plus souvent que le ménisque latéral.', o: VF, a: 0, e: 'Vrai. Attaché au ligament collatéral tibial et à la capsule, il est moins mobile : il est environ 20 fois plus souvent lésé.', s: 'art96' },
    { id: 'pp-ge8', q: 'La « triade malheureuse » du genou associe des lésions de…', o: ['LCA, LCP et ménisque latéral', 'Ligament collatéral tibial, ménisque médial et LCA', 'Ligament patellaire, ménisque médial et LCP', 'Ligament collatéral fibulaire, LCA et patella'], a: 1, e: 'Un choc violent sur la face latérale du genou tendu lèse successivement le ligament collatéral tibial, le ménisque médial et le LCA.', s: 'art96' },
    { id: 'pp-ge9', vf: 1, q: 'Le LCA se tend en extension et s’oppose à l’hyperextension du genou.', o: VF, a: 0, e: 'Vrai. Le LCA est tendu en extension et empêche l’hyperextension.', s: 'art96' },
    { id: 'pp-ge10', q: 'Lequel des ligaments croisés est le plus solide ?', o: ['Le LCA', 'Le LCP', 'Ils sont identiques', 'Aucun des deux'], a: 1, e: 'Le LCP est le plus solide. Genou fléchi en charge, il empêche le fémur de glisser vers l’avant sur le tibia.', s: 'art96' }
  );

  /* --- nouveaux chapitres --- */
  anat.chapters.push(
    { id: 'anat-mouv', t: 'Plans et mouvements',
      k: ['Tous les mouvements se décrivent depuis la position anatomique : debout, membres supérieurs le long du corps, paumes vers l’avant.',
          'Flexion et extension se font dans le plan sagittal. Abduction, adduction et flexion latérale se font dans le plan frontal.',
          'Supination : paume vers l’avant, radius et ulna parallèles. Pronation : paume vers l’arrière, le radius croise l’ulna.',
          'Flexion dorsale : le dessus du pied monte vers le tibia. Inversion et éversion du pied se font aux articulations intertarsiennes, pas à la cheville.'],
      qs: [
        { id: 'pp-mv1', q: 'Quelle est la position anatomique de référence ?', o: ['Debout, bras le long du corps, paumes vers l’arrière', 'Debout, bras le long du corps, paumes vers l’avant', 'Debout, bras tendus à l’horizontale', 'Allongé sur le dos, paumes vers le haut'], a: 1, e: 'Debout, membres supérieurs le long du corps, paumes tournées vers l’avant. Tous les mouvements sont décrits à partir de cette position.', s: 'mouv' },
        { id: 'pp-mv2', q: 'Dans quel plan se font la flexion et l’extension ?', o: ['Le plan frontal', 'Le plan transversal', 'Le plan sagittal', 'Le plan oblique'], a: 2, e: 'Flexion et extension sont des mouvements vers l’avant ou l’arrière, dans le plan sagittal.', s: 'mouv' },
        { id: 'pp-mv3', q: 'Dans quel plan se font l’abduction et l’adduction ?', o: ['Le plan frontal (coronal)', 'Le plan sagittal', 'Le plan transversal', 'Elles ne se font dans aucun plan'], a: 0, e: 'L’abduction écarte un segment de la ligne médiane et l’adduction l’en rapproche, dans le plan frontal (coronal).', s: 'mouv' },
        { id: 'pp-mv4', vf: 1, q: 'L’abduction rapproche un segment de la ligne médiane du corps.', o: VF, a: 1, e: 'Faux. L’abduction l’éloigne de la ligne médiane ; c’est l’adduction qui l’en rapproche.', s: 'mouv' },
        { id: 'pp-mv5', vf: 1, q: 'Écarter les doigts est une abduction.', o: VF, a: 0, e: 'Vrai. Écarter les doigts ou les orteils est une abduction.', s: 'mouv' },
        { id: 'pp-mv6', q: 'En pronation de l’avant-bras…', o: ['La paume regarde vers l’avant', 'Le radius et l’ulna sont parallèles', 'Le radius croise l’ulna et la paume regarde vers l’arrière', 'L’ulna tourne autour du radius immobile'], a: 2, e: 'En pronation, la paume est tournée vers l’arrière et le radius croise l’ulna en formant un X.', s: 'mouv' },
        { id: 'pp-mv7', vf: 1, q: 'En supination, le radius et l’ulna sont parallèles.', o: VF, a: 0, e: 'Vrai. En supination, paume vers l’avant, les deux os de l’avant-bras sont parallèles.', s: 'mouv' },
        { id: 'pp-mv8', q: 'La flexion dorsale de la cheville consiste à…', o: ['Pointer les orteils vers le bas', 'Relever le dessus du pied vers le tibia', 'Tourner la plante du pied vers l’intérieur', 'Tourner la plante du pied vers l’extérieur'], a: 1, e: 'Flexion dorsale : le dessus du pied remonte vers le tibia. Pointer les orteils (ou décoller le talon) est une flexion plantaire.', s: 'mouv' },
        { id: 'pp-mv9', vf: 1, q: 'L’inversion et l’éversion du pied se produisent au niveau de la cheville (articulation talo-crurale).', o: VF, a: 1, e: 'Faux. Elles se produisent aux articulations intertarsiennes, pas à la cheville.', s: 'mouv' },
        { id: 'pp-mv10', q: 'La circumduction est…', o: ['Une rotation autour de l’axe long du membre', 'Un enchaînement flexion, adduction, extension, abduction où l’extrémité décrit un cercle', 'Un mouvement de glissement entre deux os plats', 'Une flexion excessive au-delà de l’amplitude normale'], a: 1, e: 'Une extrémité du membre reste à peu près fixe tandis que l’autre décrit un cercle, en enchaînant flexion, adduction, extension et abduction.', s: 'mouv' },
        { id: 'pp-mv11', q: 'Serrer les omoplates vers la colonne vertébrale correspond à…', o: ['Une élévation des scapulas', 'Une protraction des scapulas', 'Une dépression des scapulas', 'Une rétraction des scapulas'], a: 3, e: 'La rétraction recule la scapula et la rapproche de la colonne. La protraction l’avance.', s: 'mouv' },
        { id: 'pp-mv12', vf: 1, q: 'L’opposition du pouce se fait au niveau de la première articulation carpo-métacarpienne.', o: VF, a: 0, e: 'Vrai. L’opposition amène la pulpe du pouce au contact d’un autre doigt ; elle est produite par la 1re articulation carpo-métacarpienne.', s: 'mouv' },
        { id: 'pp-mv13', q: 'Pencher le tronc sur le côté droit s’appelle…', o: ['Une flexion latérale', 'Une abduction', 'Une rotation latérale', 'Une circumduction'], a: 0, e: 'La flexion latérale incline le cou ou le tronc vers la droite ou la gauche, dans le plan frontal.', s: 'mouv' }
      ] },
    { id: 'anat-os-ms', t: 'Les os du membre supérieur',
      k: ['Le membre supérieur compte 30 os : humérus, radius, ulna, 8 os du carpe, 5 métacarpiens et 14 phalanges.',
          'L’ulna est l’os médial de l’avant-bras ; le radius est l’os latéral, côté pouce.',
          'En bas de l’humérus, la trochlée s’articule avec l’ulna et le capitulum avec le radius. L’olécrane, pointe du coude, appartient à l’ulna.',
          'Le scaphoïde est l’os du carpe le plus souvent fracturé, souvent après une chute sur la main. Mal vascularisé, il guérit lentement.'],
      qs: [
        { id: 'pp-ms1', q: 'Combien d’os compte un membre supérieur ?', o: ['27', '30', '32', '35'], a: 1, e: 'Humérus, radius, ulna, 8 os du carpe, 5 métacarpiens et 14 phalanges : 30 os, comme le membre inférieur.', s: 'osms' },
        { id: 'pp-ms2', vf: 1, q: 'L’ulna est l’os latéral de l’avant-bras, du côté du pouce.', o: VF, a: 1, e: 'Faux. L’ulna est médiale. C’est le radius qui est latéral, côté pouce.', s: 'osms' },
        { id: 'pp-ms3', q: 'Combien d’os forment le carpe (le poignet) ?', o: ['5', '7', '8', '14'], a: 2, e: '8 os du carpe, en deux rangées de 4. Attention : le tarse, au pied, en compte 7.', s: 'osms' },
        { id: 'pp-ms4', q: 'Quel os du carpe est le plus souvent fracturé ?', o: ['Le lunatum', 'Le pisiforme', 'L’hamatum', 'Le scaphoïde'], a: 3, e: 'Le scaphoïde, souvent après une chute sur la main. La douleur est parfois prise pour une entorse, et la fracture n’apparaît sur la radio que des semaines plus tard.', s: 'osms' },
        { id: 'pp-ms5', vf: 1, q: 'Le pouce possède 3 phalanges.', o: VF, a: 1, e: 'Faux. Le pouce a 2 phalanges (proximale et distale). Les doigts 2 à 5 en ont 3 chacun : 14 au total.', s: 'osms' },
        { id: 'pp-ms6', q: 'L’olécrane, la pointe osseuse du coude, appartient à…', o: ['L’humérus', 'Le radius', 'L’ulna', 'La scapula'], a: 2, e: 'L’olécrane est le processus proximal de l’ulna qui forme la pointe du coude.', s: 'osms' },
        { id: 'pp-ms7', q: 'Avec quel os le capitulum de l’humérus s’articule-t-il ?', o: ['Le radius', 'L’ulna', 'La scapula', 'Le scaphoïde'], a: 0, e: 'Le capitulum, latéral, s’articule avec la tête du radius. La trochlée, médiale, s’articule avec l’ulna.', s: 'osms' },
        { id: 'pp-ms8', q: 'Quelle zone de l’humérus est un site fréquent de fracture ?', o: ['Le col anatomique', 'Le col chirurgical', 'L’épicondyle médial', 'Le capitulum'], a: 1, e: 'Le col chirurgical, jonction entre l’extrémité proximale et la diaphyse, est un site fréquent de fracture.', s: 'osms' },
        { id: 'pp-ms9', vf: 1, q: 'La tubérosité deltoïdienne se trouve sur la face latérale de la diaphyse de l’humérus.', o: VF, a: 0, e: 'Vrai. Elle se situe à mi-hauteur, sur la face latérale, et reçoit le deltoïde.', s: 'osms' },
        { id: 'pp-ms10', q: 'L’épicondyle médial de l’humérus donne naissance…', o: ['Aux muscles antérieurs de l’avant-bras (préhension)', 'Aux muscles postérieurs de l’avant-bras', 'Au deltoïde', 'Au biceps brachial'], a: 0, e: 'Plus grand et robuste, l’épicondyle médial donne naissance aux muscles antérieurs de l’avant-bras, ceux de la préhension. Le latéral donne naissance aux muscles postérieurs.', s: 'osms' },
        { id: 'pp-ms11', vf: 1, q: 'Une fracture du scaphoïde guérit lentement car l’os est mal vascularisé.', o: VF, a: 0, e: 'Vrai. Sa vascularisation est pauvre : la consolidation est lente, avec un risque de nécrose osseuse et d’arthrose.', s: 'osms' },
        { id: 'pp-ms12', q: 'Quels os forment la rangée proximale du carpe (du latéral au médial) ?', o: ['Trapèze, trapézoïde, capitatum, hamatum', 'Scaphoïde, lunatum, triquetrum, pisiforme', 'Scaphoïde, trapèze, capitatum, pisiforme', 'Lunatum, scaphoïde, hamatum, triquetrum'], a: 1, e: 'Rangée proximale : scaphoïde, lunatum, triquetrum, pisiforme. Rangée distale : trapèze, trapézoïde, capitatum, hamatum.', s: 'osms' }
      ] },
    { id: 'anat-mus-ms', t: 'Les muscles de l’épaule et du bras',
      k: ['La coiffe des rotateurs réunit 4 tendons : supra-épineux, infra-épineux, petit rond et subscapulaire. Elle maintient la tête humérale dans la glène.',
          'Le deltoïde est le grand abducteur du bras. Le supra-épineux participe aussi à l’abduction.',
          'Infra-épineux et petit rond font la rotation latérale ; le subscapulaire, la rotation médiale.',
          'Biceps brachial : flexion du coude et supination. Brachial : flexion du coude. Triceps brachial : extension du coude.'],
      qs: [
        { id: 'pp-mb1', q: 'Quels muscles forment la coiffe des rotateurs ?', o: ['Supra-épineux, infra-épineux, grand rond, subscapulaire', 'Supra-épineux, infra-épineux, petit rond, subscapulaire', 'Deltoïde, supra-épineux, petit rond, biceps', 'Infra-épineux, petit rond, grand dorsal, trapèze'], a: 1, e: 'Les tendons du subscapulaire, du supra-épineux, de l’infra-épineux et du petit rond forment un anneau autour de l’épaule. Attention : le grand rond n’en fait pas partie.', s: 'musms' },
        { id: 'pp-mb2', q: 'Quel est le principal abducteur du bras ?', o: ['Le grand pectoral', 'Le grand dorsal', 'Le deltoïde', 'Le petit rond'], a: 2, e: 'Le deltoïde est le grand abducteur du bras. Il participe aussi à la flexion, à l’extension et aux rotations.', s: 'musms' },
        { id: 'pp-mb3', vf: 1, q: 'L’infra-épineux est un rotateur médial (interne) du bras.', o: VF, a: 1, e: 'Faux. L’infra-épineux, aidé du petit rond, fait la rotation latérale. Le rotateur médial de la coiffe est le subscapulaire.', s: 'musms' },
        { id: 'pp-mb4', q: 'Quel muscle de la coiffe des rotateurs fait la rotation médiale du bras ?', o: ['Le supra-épineux', 'L’infra-épineux', 'Le petit rond', 'Le subscapulaire'], a: 3, e: 'Le subscapulaire, qui naît de la fosse subscapulaire (face antérieure de la scapula), est rotateur médial et stabilise l’épaule.', s: 'musms' },
        { id: 'pp-mb5', q: 'Quelles sont les actions du biceps brachial ?', o: ['Extension du coude et pronation', 'Flexion du coude et supination de l’avant-bras', 'Abduction du bras uniquement', 'Rétraction de la scapula'], a: 1, e: 'Le biceps fléchit le coude et met l’avant-bras en supination. Il participe aussi à la flexion de l’épaule.', s: 'musms' },
        { id: 'pp-mb6', vf: 1, q: 'Le triceps brachial étend le coude.', o: VF, a: 0, e: 'Vrai. Il naît du tubercule infraglénoïdal de la scapula et de la face postérieure de l’humérus, et étend l’avant-bras. L’anconé l’aide.', s: 'musms' },
        { id: 'pp-mb7', q: 'D’où naît le muscle brachial ?', o: ['De la face antérieure de l’humérus distal', 'Du processus coracoïde', 'De l’épicondyle latéral', 'Du tubercule infraglénoïdal'], a: 0, e: 'Le brachial naît de la face antérieure de l’humérus distal et apporte de la force supplémentaire à la flexion du coude.', s: 'musms' },
        { id: 'pp-mb8', q: 'Quel muscle protracte la scapula et aide à l’inspiration ?', o: ['Le rhomboïde', 'Le trapèze', 'Le dentelé antérieur', 'Le grand rond'], a: 2, e: 'Le dentelé antérieur, qui naît des côtes 1 à 8 (ou 9), avance la scapula (protraction) et aide à l’inspiration.', s: 'musms' },
        { id: 'pp-mb9', vf: 1, q: 'Les rhomboïdes rétractent la scapula : ils la rapprochent de la colonne.', o: VF, a: 0, e: 'Vrai. Ils naissent des vertèbres (C7–T5) et se terminent sur le bord médial de la scapula, qu’ils rétractent et stabilisent.', s: 'musms' },
        { id: 'pp-mb10', q: 'D’où naît notamment le grand dorsal ?', o: ['Du sternum et de la clavicule', 'Des vertèbres T7–T12, des côtes 9–12 et de la crête iliaque', 'De la fosse supra-épineuse', 'Du processus coracoïde'], a: 1, e: 'Le grand dorsal, large et triangulaire, naît des vertèbres T7–T12 et des vertèbres inférieures, des côtes 9–12 et de la crête iliaque.', s: 'musms' },
        { id: 'pp-mb11', q: 'Quel muscle tourne la main paume vers le bas (pronation) ?', o: ['Le supinateur', 'Le brachio-radial', 'L’anconé', 'Le rond pronateur'], a: 3, e: 'Le rond pronateur naît de l’épicondyle médial et du processus coronoïde de l’ulna, et assure la pronation.', s: 'musms' },
        { id: 'pp-mb12', vf: 1, q: 'Le trapèze élève les épaules et rétracte les scapulas.', o: VF, a: 0, e: 'Vrai. Le trapèze élève les épaules, rétracte les scapulas et incline la tête vers l’arrière.', s: 'musms' },
        { id: 'pp-mb13', vf: 1, q: 'Le grand rond fait partie de la coiffe des rotateurs.', o: VF, a: 1, e: 'Faux. La coiffe compte le supra-épineux, l’infra-épineux, le petit rond et le subscapulaire. Le grand rond étend le bras et aide à l’adduction et à la rotation médiale.', s: 'musms' }
      ] },
    { id: 'anat-rachis', t: 'La colonne vertébrale',
      k: ['Chez l’adulte : 7 cervicales, 12 thoraciques, 5 lombaires, plus le sacrum (5 vertèbres soudées) et le coccyx (4 soudées).',
          'Courbures primaires (thoracique et sacro-coccygienne) : héritées du fœtus. Courbures secondaires : cervicale quand le bébé tient sa tête, lombaire quand l’enfant se tient debout et marche.',
          'C1 (atlas) n’a ni corps ni processus épineux. C2 (axis) porte la dent, pivot de la rotation de la tête.',
          'Disque : anneau fibreux (anulus fibrosus) autour d’un noyau gélatineux (nucleus pulposus). Une hernie se fait quand le noyau traverse l’anneau, le plus souvent vers l’arrière.'],
      qs: [
        { id: 'pp-ra1', q: 'Combien de vertèbres cervicales compte l’adulte ?', o: ['5', '7', '8', '12'], a: 1, e: '7 cervicales (C1 à C7).', s: 'rachis' },
        { id: 'pp-ra2', q: 'Combien de vertèbres thoraciques compte l’adulte ?', o: ['7', '10', '12', '5'], a: 2, e: '12 thoraciques (T1 à T12), qui s’articulent avec les côtes.', s: 'rachis' },
        { id: 'pp-ra3', q: 'Combien de vertèbres lombaires compte l’adulte ?', o: ['4', '5', '6', '7'], a: 1, e: '5 lombaires (L1 à L5). Ce sont les plus grosses : elles portent le plus de poids.', s: 'rachis' },
        { id: 'pp-ra4', vf: 1, q: 'Le sacrum est formé de 5 vertèbres soudées.', o: VF, a: 0, e: 'Vrai. Le sacrum provient de la fusion de 5 vertèbres sacrées, et le coccyx de 4 petites vertèbres.', s: 'rachis' },
        { id: 'pp-ra5', q: 'Quelles sont les courbures primaires de la colonne ?', o: ['Cervicale et lombaire', 'Thoracique et lombaire', 'Thoracique et sacro-coccygienne', 'Cervicale et thoracique'], a: 2, e: 'Les courbures thoracique et sacro-coccygienne sont héritées de la courbure du fœtus (concaves vers l’avant). Cervicale et lombaire sont secondaires.', s: 'rachis' },
        { id: 'pp-ra6', q: 'Quand apparaît la courbure lombaire ?', o: ['Avant la naissance', 'Quand le bébé commence à tenir sa tête', 'Quand l’enfant se tient debout et marche', 'À la puberté'], a: 2, e: 'La courbure lombaire apparaît quand l’enfant commence à se tenir debout et à marcher. La cervicale apparaît quand le bébé tient sa tête.', s: 'rachis' },
        { id: 'pp-ra7', vf: 1, q: 'L’atlas (C1) n’a ni corps vertébral ni processus épineux.', o: VF, a: 0, e: 'Vrai. L’atlas est un anneau (arcs antérieur et postérieur) qui supporte le crâne.', s: 'rachis' },
        { id: 'pp-ra8', q: 'La dent (processus odontoïde), pivot de la rotation de la tête, appartient à…', o: ['L’atlas (C1)', 'L’axis (C2)', 'C7', 'L’occipital'], a: 1, e: 'La dent de l’axis (C2) se projette vers le haut et est maintenue par le ligament transverse de l’atlas.', s: 'rachis' },
        { id: 'pp-ra9', q: 'Lors d’une hernie discale…', o: ['L’anulus fibrosus sort à travers le nucleus pulposus', 'Le nucleus pulposus traverse l’anulus fibrosus, le plus souvent vers l’arrière', 'La vertèbre glisse vers l’avant', 'Le disque se calcifie'], a: 1, e: 'Le noyau gélatineux pousse à travers un anneau fibreux affaibli, généralement vers l’arrière, et peut comprimer un nerf spinal. Sites fréquents : L4/L5 et L5/S1.', s: 'rachis' },
        { id: 'pp-ra10', vf: 1, q: 'Les disques intervertébraux sont plus épais en région cervicale qu’en région lombaire.', o: VF, a: 1, e: 'Faux. Les disques sont les plus fins en cervical et les plus épais en lombaire.', s: 'rachis' },
        { id: 'pp-ra11', q: 'Une cyphose est…', o: ['Un excès de courbure lombaire vers l’avant', 'Une courbure latérale avec torsion', 'Un excès de courbure thoracique vers l’arrière', 'Un tassement du sacrum'], a: 2, e: 'Cyphose : excès de courbure postérieure en région thoracique. Lordose : excès de courbure antérieure en lombaire. Scoliose : courbure latérale avec torsion.', s: 'rachis' },
        { id: 'pp-ra12', q: 'Quelles vertèbres possèdent des foramens transversaires (passage d’une artère vers le cerveau) ?', o: ['Les cervicales', 'Les thoraciques', 'Les lombaires', 'Les sacrées'], a: 0, e: 'Les vertèbres cervicales ont des foramens transversaires et souvent un processus épineux bifide.', s: 'rachis' },
        { id: 'pp-ra13', vf: 1, q: 'Le ligament longitudinal antérieur limite l’extension (le penché en arrière) de la colonne.', o: VF, a: 0, e: 'Vrai. Il court sur la face antérieure des corps vertébraux et s’oppose à une flexion excessive vers l’arrière.', s: 'rachis' },
        { id: 'pp-ra14', q: 'Le ligament jaune…', o: ['Relie les corps vertébraux par l’avant', 'Relie les lames vertébrales et contient beaucoup de fibres élastiques', 'Relie le crâne aux épineuses cervicales', 'Relie les côtes au sternum'], a: 1, e: 'Situé en arrière de la moelle, le ligament jaune relie les lames des vertèbres voisines et est riche en fibres élastiques.', s: 'rachis' }
      ] },
    { id: 'anat-art', t: 'Épaule, coude, hanche et cheville',
      k: ['L’épaule (gléno-humérale) est une énarthrose : la plus grande amplitude du corps, mais peu stable. La coiffe des rotateurs est son principal soutien.',
          'La hanche est aussi une énarthrose, mais plus stable et moins mobile car elle porte le poids du corps. Ligaments : ilio-fémoral, pubo-fémoral, ischio-fémoral.',
          'Le coude réunit 3 articulations dans une même capsule : huméro-ulnaire, huméro-radiale et radio-ulnaire proximale. Le ligament annulaire entoure la tête du radius.',
          'Cheville : entorse la plus fréquente en inversion, avec atteinte du ligament talo-fibulaire antérieur. Le ligament deltoïde (médial) limite l’éversion.'],
      qs: [
        { id: 'pp-ar1', q: 'Quelle articulation a la plus grande amplitude de mouvement du corps ?', o: ['La hanche', 'Le genou', 'L’épaule (gléno-humérale)', 'Le coude'], a: 2, e: 'L’épaule, énarthrose entre la tête humérale et la cavité glénoïdale, a la plus grande amplitude du corps.', s: 'art96' },
        { id: 'pp-ar2', vf: 1, q: 'L’épaule est très mobile mais peu stable.', o: VF, a: 0, e: 'Vrai. Elle a peu de soutien ligamentaire ; ce sont surtout les tendons de la coiffe des rotateurs qui la stabilisent.', s: 'art96' },
        { id: 'pp-ar3', q: 'Dans quelle direction se font la plupart des luxations de l’humérus ?', o: ['Vers le haut', 'Vers le bas', 'Vers l’arrière uniquement', 'Vers l’intérieur'], a: 1, e: 'La plupart des luxations de l’humérus sont inférieures (vers le bas).', s: 'art96' },
        { id: 'pp-ar4', q: 'Le labrum glénoïdal est…', o: ['Un ligament qui relie la clavicule à la scapula', 'Un bourrelet fibrocartilagineux qui approfondit la cavité glénoïdale', 'Un tendon de la coiffe des rotateurs', 'Une bourse remplie de liquide'], a: 1, e: 'C’est une lèvre de fibrocartilage sur le pourtour de la glène, qui l’approfondit légèrement.', s: 'art96' },
        { id: 'pp-ar5', vf: 1, q: 'La hanche est plus stable et moins mobile que l’épaule.', o: VF, a: 0, e: 'Vrai. Elle porte le poids du corps debout et à la marche : elle sacrifie de la mobilité au profit de la stabilité.', s: 'art96' },
        { id: 'pp-ar6', q: 'Lequel de ces ligaments n’appartient PAS à la hanche ?', o: ['L’ilio-fémoral', 'Le pubo-fémoral', 'L’ischio-fémoral', 'L’annulaire'], a: 3, e: 'Le ligament annulaire appartient au coude (il entoure la tête du radius). Les ligaments de la hanche se tendent en extension et plaquent la tête fémorale dans l’acétabulum.', s: 'art96' },
        { id: 'pp-ar7', q: 'Que maintient le ligament annulaire du coude ?', o: ['La tête du radius', 'L’olécrane', 'La trochlée', 'Le processus coronoïde'], a: 0, e: 'Il encercle la tête du radius et la maintient contre l’ulna (articulation radio-ulnaire proximale).', s: 'art96' },
        { id: 'pp-ar8', vf: 1, q: 'Le coude réunit 3 articulations dans une seule capsule.', o: VF, a: 0, e: 'Vrai : huméro-ulnaire (charnière), huméro-radiale et radio-ulnaire proximale (pivot).', s: 'art96' },
        { id: 'pp-ar9', q: 'Quel ligament est le plus souvent lésé dans l’entorse de cheville ?', o: ['Le ligament deltoïde', 'Le ligament talo-fibulaire antérieur', 'Le ligament talo-fibulaire postérieur', 'Le ligament croisé antérieur'], a: 1, e: 'L’entorse la plus fréquente se fait en inversion et touche d’abord le talo-fibulaire antérieur, puis le calcanéo-fibulaire.', s: 'art96' },
        { id: 'pp-ar10', q: 'Le ligament deltoïde, côté médial de la cheville, s’oppose surtout à…', o: ['L’inversion excessive', 'L’éversion excessive', 'La flexion dorsale', 'La flexion plantaire'], a: 1, e: 'Large ligament médial, il soutient la cheville et résiste à l’éversion excessive.', s: 'art96' },
        { id: 'pp-ar11', vf: 1, q: 'Le ligament de la tête fémorale est le principal stabilisateur de la hanche.', o: VF, a: 1, e: 'Faux. Il est normalement détendu et apporte peu de soutien. Son rôle est surtout de transporter une artère vers la tête du fémur.', s: 'art96' }
      ] }
  );
})();

/* ===== Anatomie — QCM à plusieurs bonnes réponses (multi:1, a = liste des bonnes réponses) ===== */
(function(){
  var anat = window.MFC_PREPA.tracks[0].subjects.filter(function(s){ return s.id === 'anat'; })[0];
  function add(id, qs){ anat.chapters.filter(function(c){ return c.id === id; })[0].qs.push.apply(anat.chapters.filter(function(c){ return c.id === id; })[0].qs, qs); }
  add('anat-os-mi', [
    { id: 'pp-os14', multi: 1, q: 'Lesquels sont des os du tarse (pied) ?', o: ['Le talus', 'Le calcanéus', 'L’os naviculaire', 'Le scaphoïde', 'Le lunatum'], a: [0, 1, 2], e: 'Talus, calcanéus et naviculaire font partie des 7 os du tarse. Le scaphoïde et le lunatum sont des os du carpe (poignet).', s: 'osmi' },
    { id: 'pp-os15', multi: 1, q: 'Avec quels os le fémur s’articule-t-il ?', o: ['L’os coxal', 'Le tibia', 'La patella', 'La fibula'], a: [0, 1, 2], e: 'Le fémur s’articule avec l’os coxal (hanche), le tibia et la patella (genou). La fibula ne s’articule pas avec le fémur.', s: 'osmi' }
  ]);
  add('anat-mus-cuisse', [
    { id: 'pp-mu18', multi: 1, q: 'Quels muscles forment le quadriceps fémoral ?', o: ['Le droit fémoral', 'Le vaste latéral', 'Le vaste médial', 'Le vaste intermédiaire', 'Le sartorius'], a: [0, 1, 2, 3], e: 'Le quadriceps réunit 4 chefs : droit fémoral et vastes latéral, médial et intermédiaire. Le sartorius est un autre muscle de la cuisse.', s: 'musmi' },
    { id: 'pp-mu19', multi: 1, q: 'Quels muscles forment les ischio-jambiers ?', o: ['Le biceps fémoral', 'Le semi-tendineux', 'Le semi-membraneux', 'Le gracile'], a: [0, 1, 2], e: 'Biceps fémoral, semi-tendineux et semi-membraneux. Le gracile est un adducteur de la cuisse.', s: 'musmi' }
  ]);
  add('anat-jambe', [
    { id: 'pp-ja8', multi: 1, q: 'Quelles sont les loges musculaires de la jambe ?', o: ['Antérieure', 'Latérale', 'Postérieure', 'Médiale'], a: [0, 1, 2], e: 'Les fascias divisent la jambe en 3 loges : antérieure, latérale et postérieure. Il n’y a pas de loge médiale.', s: 'musmi' },
    { id: 'pp-ja9', multi: 1, q: 'Quels mouvements se font à la cheville (articulation talo-crurale) ?', o: ['La flexion dorsale', 'La flexion plantaire', 'L’inversion', 'L’éversion'], a: [0, 1], e: 'La cheville fait la flexion dorsale et la flexion plantaire. L’inversion et l’éversion se font aux articulations intertarsiennes.', s: 'mouv' }
  ]);
  add('anat-genou', [
    { id: 'pp-ge11', multi: 1, q: 'Quelles articulations composent le genou ?', o: ['Fémoro-patellaire', 'Fémoro-tibiale médiale', 'Fémoro-tibiale latérale', 'Tibio-fibulaire proximale'], a: [0, 1, 2], e: 'Le genou réunit 3 articulations : fémoro-patellaire et fémoro-tibiales médiale et latérale. La tibio-fibulaire proximale est une articulation à part.', s: 'artgen' },
    { id: 'pp-ge12', multi: 1, q: 'Quels ligaments du genou sont situés à l’intérieur de l’articulation ?', o: ['Le LCA', 'Le LCP', 'Le ligament collatéral tibial', 'Le ligament collatéral fibulaire'], a: [0, 1], e: 'Les ligaments croisés (LCA et LCP) sont intra-articulaires. Les collatéraux sont à l’extérieur, sur les côtés.', s: 'artgen' }
  ]);
  add('anat-mouv', [
    { id: 'pp-mv14', multi: 1, q: 'Quels mouvements se font dans le plan frontal ?', o: ['L’abduction', 'L’adduction', 'La flexion latérale du tronc', 'La flexion du coude', 'La rotation médiale'], a: [0, 1, 2], e: 'Abduction, adduction et flexion latérale se font dans le plan frontal. La flexion du coude se fait dans le plan sagittal.', s: 'mouv' },
    { id: 'pp-mv15', multi: 1, q: 'Quels mouvements s’enchaînent dans une circumduction ?', o: ['Flexion', 'Adduction', 'Extension', 'Abduction', 'Pronation'], a: [0, 1, 2, 3], e: 'La circumduction enchaîne flexion, adduction, extension et abduction ; l’extrémité du membre décrit un cercle.', s: 'mouv' }
  ]);
  add('anat-os-ms', [
    { id: 'pp-ms13', multi: 1, q: 'Lesquels sont des os du carpe (poignet) ?', o: ['Le scaphoïde', 'Le lunatum', 'Le capitatum', 'L’hamatum', 'Le talus', 'Le calcanéus'], a: [0, 1, 2, 3], e: 'Scaphoïde, lunatum, capitatum et hamatum sont des os du carpe. Le talus et le calcanéus sont des os du tarse (pied).', s: 'osms' },
    { id: 'pp-ms14', multi: 1, q: 'Avec quels os l’extrémité distale de l’humérus s’articule-t-elle ?', o: ['Le radius', 'L’ulna', 'La scapula', 'La clavicule'], a: [0, 1], e: 'La trochlée s’articule avec l’ulna et le capitulum avec le radius. La scapula s’articule avec la tête de l’humérus, en haut.', s: 'osms' }
  ]);
  add('anat-mus-ms', [
    { id: 'pp-mb14', multi: 1, q: 'Quels muscles forment la coiffe des rotateurs ?', o: ['Le supra-épineux', 'L’infra-épineux', 'Le petit rond', 'Le subscapulaire', 'Le grand rond', 'Le deltoïde'], a: [0, 1, 2, 3], e: 'Supra-épineux, infra-épineux, petit rond et subscapulaire. Le grand rond et le deltoïde n’en font pas partie.', s: 'musms' },
    { id: 'pp-mb15', multi: 1, q: 'Quels muscles fléchissent le coude ?', o: ['Le biceps brachial', 'Le brachial', 'Le brachio-radial', 'Le triceps brachial', 'L’anconé'], a: [0, 1, 2], e: 'Biceps brachial, brachial et brachio-radial fléchissent l’avant-bras. Le triceps et l’anconé l’étendent.', s: 'musms' },
    { id: 'pp-mb16', multi: 1, q: 'Quels muscles rétractent la scapula (la rapprochent de la colonne) ?', o: ['Le trapèze', 'Le grand rhomboïde', 'Le petit rhomboïde', 'Le dentelé antérieur'], a: [0, 1, 2], e: 'Le trapèze et les rhomboïdes rétractent la scapula. Le dentelé antérieur fait l’inverse : il la protracte.', s: 'musms' }
  ]);
  add('anat-rachis', [
    { id: 'pp-ra15', multi: 1, q: 'Quelles sont les courbures secondaires de la colonne ?', o: ['Cervicale', 'Lombaire', 'Thoracique', 'Sacro-coccygienne'], a: [0, 1], e: 'Les courbures cervicale et lombaire apparaissent après la naissance. Thoracique et sacro-coccygienne sont primaires.', s: 'rachis' },
    { id: 'pp-ra16', multi: 1, q: 'Quelles caractéristiques ont les vertèbres cervicales ?', o: ['Des foramens transversaires', 'Un processus épineux souvent bifide', 'Des facettes costales', 'Les corps les plus épais de la colonne'], a: [0, 1], e: 'Les cervicales ont des foramens transversaires et un processus épineux souvent bifide. Les facettes costales sont thoraciques, et les corps les plus épais sont lombaires.', s: 'rachis' },
    { id: 'pp-ra17', multi: 1, q: 'Quels sont des sites fréquents de hernie discale ?', o: ['L4/L5', 'L5/S1', 'C5/C6', 'T6/T7'], a: [0, 1, 2], e: 'Sites fréquents : L4/L5 et L5/S1 (sciatique), C5/C6 et C6/C7 (douleurs du cou et du bras).', s: 'rachis' }
  ]);
  add('anat-art', [
    { id: 'pp-ar12', multi: 1, q: 'Quelles articulations sont des énarthroses (sphéroïdes) ?', o: ['L’épaule (gléno-humérale)', 'La hanche', 'Le coude (huméro-ulnaire)', 'La cheville'], a: [0, 1], e: 'L’épaule et la hanche sont des énarthroses. L’huméro-ulnaire et la cheville sont des articulations en charnière.', s: 'art96' },
    { id: 'pp-ar13', multi: 1, q: 'Quels ligaments renforcent la hanche ?', o: ['L’ilio-fémoral', 'Le pubo-fémoral', 'L’ischio-fémoral', 'L’annulaire', 'Le deltoïde'], a: [0, 1, 2], e: 'Ilio-fémoral, pubo-fémoral et ischio-fémoral. L’annulaire est au coude, le deltoïde à la cheville.', s: 'art96' },
    { id: 'pp-ar14', multi: 1, q: 'Quelles articulations partagent la capsule du coude ?', o: ['Huméro-ulnaire', 'Huméro-radiale', 'Radio-ulnaire proximale', 'Radio-ulnaire distale'], a: [0, 1, 2], e: 'Huméro-ulnaire, huméro-radiale et radio-ulnaire proximale. La radio-ulnaire distale est au poignet.', s: 'art96' }
  ]);
})();
