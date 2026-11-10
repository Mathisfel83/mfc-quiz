/* MFC Quiz — parcours de leçons. Chaque leçon = une intro + les fiches « à retenir » (explications sourcées des questions) + un quiz.
   k = groupes « module|source » dont les questions composent la leçon. Ordre = du plus simple au plus pointu. */
window.MFC_LESSONS = [
  /* ---------- LE MUSCLE ---------- */
  { id: 'mu-volume', m: 'muscle', e: '📈', t: 'Combien de séries pour progresser ?', i: 'Le volume, c’est le nombre de séries que tu fais par muscle et par semaine. C’est l’un des leviers les plus étudiés pour prendre du muscle. Et la fréquence compte aussi.', k: ['muscle|schoenfeld2017vol', 'muscle|schoenfeld2016freq'] },
  { id: 'mu-charge', m: 'muscle', e: '🏋️', t: 'Lourd ou léger ? Et combien de repos ?', i: 'Faut-il soulever lourd pour faire grossir ses muscles ? Et combien de temps se reposer entre deux séries ? Deux questions que se pose tout pratiquant.', k: ['muscle|schoenfeld2017load', 'muscle|schoenfeld2016rest'] },
  { id: 'mu-echec', m: 'muscle', e: '🔥', t: 'Faut-il aller jusqu’à l’échec ?', i: 'Aller à l’échec, c’est continuer une série jusqu’à ne plus pouvoir faire une seule répétition. Est-ce indispensable pour progresser ?', k: ['muscle|grgic2022failure'] },
  { id: 'mu-amplitude', m: 'muscle', e: '📏', t: 'L’amplitude de mouvement', i: 'L’amplitude, c’est la distance parcourue pendant le mouvement : squat complet ou demi-squat ? Les études ont comparé les deux.', k: ['muscle|schoenfeld2020rom', 'muscle|pallares2021'] },
  { id: 'mu-proteines', m: 'muscle', e: '🥩', t: 'Protéines et prise de muscle', i: 'Les protéines fournissent les briques du muscle. Mais c’est l’entraînement et l’alimentation, ensemble, qui font la différence.', k: ['muscle|jager2017', 'muscle|morton2018'] },
  { id: 'mu-creatine', m: 'muscle', e: '⚡', t: 'Ce que fait la créatine', i: 'La créatine est l’un des compléments les plus étudiés au monde. Voyons ce qu’elle fait vraiment dans ton muscle.', k: ['muscle|kreider2017'] },
  { id: 'mu-memoire', m: 'muscle', e: '🧬', t: 'La mémoire musculaire', i: 'Pourquoi reprend-on plus vite du muscle qu’on a déjà eu ? Une piste se cache dans les noyaux des fibres musculaires.', k: ['muscle|bruusgaard2010'] },
  { id: 'mu-cardio', m: 'muscle', e: '🤝', t: 'Cardio et muscu : compatibles ?', i: 'On entend souvent que le cardio « fait fondre le muscle ». Une méta-analyse a regroupé des dizaines d’études pour vérifier.', k: ['muscle|schumann2022'] },
  { id: 'mu-seche', m: 'muscle', e: '✂️', t: 'Perdre du gras sans perdre de muscle', i: 'Perdre du poids trop vite ou faire des abdos « pour le ventre » : deux erreurs classiques. Voici ce que montrent les études.', k: ['muscle|garthe2011', 'nutrition|garthe2011', 'muscle|vispute2011'] },

  /* ---------- CŒUR & ENDURANCE ---------- */
  { id: 'ca-fcmax', m: 'cardio', e: '❤️', t: 'Ta fréquence cardiaque max', i: 'La fréquence cardiaque maximale (FC max) sert à calculer tes zones d’entraînement. Mais la formule la plus connue est-elle la bonne ?', k: ['cardio|tanaka2001'] },
  { id: 'ca-vo2', m: 'cardio', e: '🫁', t: 'La VO2max et comment l’améliorer', i: 'La VO2max mesure la quantité maximale d’oxygène que ton corps peut utiliser. C’est un indicateur clé de ta forme… et elle se travaille.', k: ['cardio|milanovic2015'] },
  { id: 'ca-lactate', m: 'cardio', e: '🔋', t: 'Le lactate, un carburant méconnu', i: 'Le lactate a longtemps été accusé de tous les maux. La science a complètement changé de regard sur lui.', k: ['cardio|brooks2018'] },
  { id: 'ca-8020', m: 'cardio', e: '🏃', t: 'S’entraîner comme les pros : le 80/20', i: 'Comment s’entraînent les meilleurs athlètes d’endurance au monde ? Leur répartition tient en deux chiffres.', k: ['cardio|seiler2010'] },
  { id: 'ca-longevite', m: 'cardio', e: '⏳', t: 'Forme cardio et espérance de vie', i: 'Ta capacité cardio ne sert pas qu’à courir vite : c’est aussi un marqueur puissant de santé sur le long terme.', k: ['cardio|mandsager2018', 'cardio|kodama2009'] },
  { id: 'ca-blessures', m: 'cardio', e: '🦵', t: 'Débuter la course sans se blesser', i: 'Tu débutes la course à pied ? Voici ce que disent les chiffres sur les blessures, selon ton niveau.', k: ['cardio|videbaek2015'] },

  /* ---------- NUTRITION ---------- */
  { id: 'nu-proteines', m: 'nutrition', e: '🍳', t: 'Combien de protéines, et quand ?', i: 'Combien de protéines par jour, par repas, et sous quelle forme ? Les réponses de la Société internationale de nutrition du sport (ISSN).', k: ['nutrition|jager2017'] },
  { id: 'nu-glucides', m: 'nutrition', e: '🍝', t: 'Les glucides du sportif', i: 'Les glucides sont le carburant principal des efforts intenses. Tes besoins dépendent surtout de ta charge d’entraînement.', k: ['nutrition|thomas2016'] },
  { id: 'nu-effort', m: 'nutrition', e: '⏱️', t: 'Manger pendant et après l’effort', i: 'Que prendre pendant une sortie longue ? La « fenêtre anabolique » existe-t-elle vraiment ? Faisons le tri.', k: ['nutrition|jeukendrup2014', 'nutrition|aragon2013'] },
  { id: 'nu-ultra', m: 'nutrition', e: '🍔', t: 'Les aliments ultra-transformés', i: 'Les aliments ultra-transformés sont partout. Une étude très contrôlée a mesuré ce qu’ils changent vraiment dans ton assiette.', k: ['nutrition|hall2019'] },
  { id: 'nu-creatine', m: 'nutrition', e: '🥫', t: 'La créatine : où, combien, est-ce sûr ?', i: 'Où trouve-t-on la créatine dans l’alimentation, et que dit la science sur sa sécurité ?', k: ['nutrition|kreider2017'] },
  { id: 'nu-cafeine', m: 'nutrition', e: '☕', t: 'La caféine et la performance', i: 'La caféine fait partie des rares compléments dont l’effet sur la performance est bien établi. À condition de bien la doser.', k: ['nutrition|guest2021', 'cardio|guest2021', 'sommeil|guest2021'] },
  { id: 'nu-beta', m: 'nutrition', e: '🧪', t: 'La bêta-alanine', i: 'La bêta-alanine est un complément populaire pour les efforts intenses. Comment fonctionne-t-elle, et pour quels efforts ?', k: ['nutrition|trexler2015', 'nutrition|saunders2017'] },
  { id: 'nu-bicar', m: 'nutrition', e: '🧂', t: 'Le bicarbonate de sodium', i: 'Oui, le bicarbonate de la cuisine ! Il est étudié comme aide à la performance pour certains efforts.', k: ['nutrition|grgic2021bicarb'] },
  { id: 'nu-alcool', m: 'nutrition', e: '🍺', t: 'L’alcool après le sport', i: 'Un verre après l’entraînement : quel impact sur tes muscles ? Une étude a mesuré l’effet.', k: ['nutrition|parr2014', 'muscle|parr2014', 'recup|parr2014'] },

  /* ---------- SOMMEIL ---------- */
  { id: 'so-duree', m: 'sommeil', e: '🛏️', t: 'Combien d’heures dormir ?', i: 'Combien d’heures de sommeil faut-il vraiment ? Un panel d’experts a fixé des repères selon l’âge.', k: ['sommeil|nsf2015'] },
  { id: 'so-perf', m: 'sommeil', e: '🏀', t: 'Sommeil et performance', i: 'Le sommeil est l’outil de récupération le plus sous-estimé. Voici son effet sur le corps et sur le cerveau.', k: ['sommeil|mah2011', 'sommeil|fullagar2015'] },
  { id: 'so-ennemis', m: 'sommeil', e: '📱', t: 'Café tardif et écrans le soir', i: 'Deux habitudes qui sabotent ton sommeil… souvent sans que tu t’en rendes compte.', k: ['sommeil|drake2013', 'sommeil|chang2015'] },
  { id: 'so-regime', m: 'sommeil', e: '⚖️', t: 'Sommeil et perte de gras', i: 'Tu surveilles ton alimentation pour perdre du gras ? Ton sommeil compte aussi, et beaucoup.', k: ['sommeil|nedeltcheva2010'] },
  { id: 'so-blessures', m: 'sommeil', e: '🩹', t: 'Sommeil et blessures', i: 'Bien dormir protège aussi ton corps des blessures, en particulier chez les jeunes sportifs.', k: ['sommeil|milewski2014'] },

  /* ---------- RÉCUPÉRATION ---------- */
  { id: 're-courbatures', m: 'recup', e: '🤕', t: 'Comprendre les courbatures', i: 'Les courbatures apparaissent après un effort inhabituel. D’où viennent-elles, et comment continuer à s’entraîner avec ?', k: ['recup|cheung2003'] },
  { id: 're-techniques', m: 'recup', e: '🧊', t: 'Les techniques de récup qui marchent', i: 'Massage, froid, compression, récupération active : 99 études comparées pour savoir ce qui fonctionne. Et un piège avec les bains froids.', k: ['recup|dupuy2018', 'recup|roberts2015', 'muscle|roberts2015'] },
  { id: 're-rouleau', m: 'recup', e: '🌀', t: 'Le rouleau de massage', i: 'Le rouleau de massage (foam roller) est partout dans les salles. Que dit la science de ses effets ?', k: ['recup|wiewelhove2019'] },
  { id: 're-etirements', m: 'recup', e: '🤸', t: 'S’étirer avant le sport ?', i: 'S’étirer avant l’effort : bonne ou mauvaise idée ? Tout dépend du type et de la durée de l’étirement.', k: ['recup|behm2016'] },
  { id: 're-prevention', m: 'recup', e: '🛡️', t: 'Prévenir les blessures', i: 'Une blessure coûte des semaines d’entraînement. Quelles méthodes la préviennent vraiment ?', k: ['recup|lauersen2014', 'sante|lauersen2014', 'recup|vandyk2019'] },

  /* ---------- SPORT & SANTÉ ---------- */
  { id: 'sa-oms', m: 'sante', e: '🌍', t: 'Les recommandations de l’OMS', i: 'Combien d’activité physique faut-il pour être en bonne santé ? L’Organisation mondiale de la santé a fixé des repères pour tous les âges.', k: ['sante|who2020'] },
  { id: 'sa-pas', m: 'sante', e: '👟', t: 'Combien de pas par jour ?', i: '10 000 pas par jour : objectif scientifique ou slogan ? Les études ont tranché.', k: ['sante|paluch2022'] },
  { id: 'sa-assis', m: 'sante', e: '🪑', t: 'Assis toute la journée', i: 'Tu passes tes journées assis ? Voici ce que l’activité physique peut compenser… et ce qu’elle ne compense pas.', k: ['sante|ekelund2016', 'cardio|ekelund2016'] },
  { id: 'sa-muscu', m: 'sante', e: '💪', t: 'Musculation et longévité', i: 'La musculation n’est pas qu’une affaire d’esthétique : elle est liée à la santé et à l’espérance de vie.', k: ['sante|momma2022'] },
  { id: 'sa-os', m: 'sante', e: '🦴', t: 'Des os solides', i: 'Les os aussi s’entraînent. Une étude a testé la musculation lourde chez des femmes aux os fragiles.', k: ['sante|watson2018'] },
  { id: 'sa-moral', m: 'sante', e: '🧠', t: 'Sport et moral', i: 'Le sport agit sur le corps… et sur la tête. Que disent les études sur l’humeur, le stress et l’anxiété ?', k: ['sante|singh2023'] },
  { id: 'sa-eau', m: 'sante', e: '💧', t: 'Bien s’hydrater', i: 'Combien boire chaque jour, et comment s’hydrater avant, pendant et après l’effort ?', k: ['sante|efsa2010', 'sante|acsm2007', 'cardio|acsm2007'] }
];
