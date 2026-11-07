import type { en } from "./en";

export const fr = {
	appLayout: {
		toggleSidebar: "Afficher ou masquer la barre latérale",
	},
	dialog: {
		close: "Fermer",
	},
	notFound: {
		title: "Page introuvable",
		home: "Retour à vos CV",
	},
	theme: {
		toggle: "Changer le thème",
		light: "Clair",
		dark: "Sombre",
		system: "Système",
	},
	uiLocale: {
		label: "Langue de l’interface",
		option: {
			en: "Anglais",
			fr: "Français",
		},
	},
	cvLocale: {
		option: {
			en: "Anglais",
			fr: "Français",
		},
	},
	cvList: {
		heading: "Vos CV",
		create: "Créer un CV",
		import: "Importer un CV",
		empty: "Aucun CV pour le moment.",
		loading: "Chargement des CV…",
		meta: "Langue du CV : {{locale}} · Mis à jour {{updatedAt}}",
		delete: "Supprimer ce CV",
		deleteNamed: "Supprimer ce CV : {{title}}",
		duplicate: "Dupliquer ce CV",
		duplicateNamed: "Dupliquer ce CV : {{title}}",
		export: "Exporter ce CV",
		exportNamed: "Exporter ce CV : {{title}}",
		selectAll: "Sélectionner tous les CV",
		clearSelection: "Effacer la sélection",
		selectNamed: "Sélectionner {{title}}",
		exportAll: "Exporter tous les CV",
		exportSelected: "Exporter les CV sélectionnés",
		importLibrary: "Importer la bibliothèque",
		unknownDate: "Date inconnue",
	},
	libraryExport: {
		invalidJson: "Ce fichier n’est pas un JSON valide.",
		unsupportedVersion:
			"Ce fichier n’est pas une sauvegarde de bibliothèque prise en charge (forme ou version incorrecte).",
		invalidSchema:
			"Impossible d’importer « {{cvLabel}} ». Il ne correspond pas au schéma CV.",
		empty: "Ce fichier de bibliothèque ne contient aucun CV.",
	},
	libraryImport: {
		title: "Importer la bibliothèque",
		description:
			"Ajoutez des CV depuis une sauvegarde de bibliothèque, ou remplacez toute la bibliothèque par le fichier.",
		add: "Ajouter des CV",
		replace: "Remplacer la bibliothèque",
		confirmReplaceTitle: "Remplacer toute la bibliothèque ?",
		confirmReplaceDescription:
			"Tous les CV locaux seront supprimés, puis le fichier sera chargé. Cette action est irréversible.",
		confirmReplace: "Remplacer la bibliothèque",
		chooseFileDescription:
			"Choisissez un fichier de sauvegarde de bibliothèque Frost CV.",
		chooseFile: "Choisir un fichier",
		cancel: "Annuler",
		importSuccess: "Bibliothèque importée.",
		importFailed: "Impossible d’importer cette bibliothèque.",
	},
	cvExport: {
		export: "Exporter le CV",
		importTitle: "Importer un CV",
		importDescription:
			"Choisissez un fichier Frost CV. Un nouveau CV sera créé.",
		replace: "Remplacer le CV",
		replaceTitle: "Remplacer le CV",
		replaceDescription:
			"L’import remplacera « {{title}} » par le contenu du fichier. Cette action est irréversible.",
		replaceReady: "Prêt à remplacer par « {{title}} ».",
		replaceConfirm: "Remplacer le CV",
		chooseFile: "Choisir un fichier",
		cancel: "Annuler",
		invalidJson: "Ce fichier n’est pas un JSON valide.",
		unsupportedVersion:
			"Cette version d’export JSON n’est pas prise en charge.",
		invalidSchema: "Ce fichier JSON ne correspond pas au schéma d’export CV.",
		importFailed: "Impossible d’importer ce CV.",
		importSuccess: "CV importé.",
		replaceSuccess: "CV remplacé.",
	},
	createCv: {
		title: "Créer un CV",
		fieldTitle: "Titre",
		fieldLocale: "Langue du CV",
		cancel: "Annuler",
		submit: "Créer le CV",
		titleRequired: "Le titre est obligatoire",
		failed: "Impossible de créer le CV",
	},
	duplicateCv: {
		title: "Dupliquer le CV",
		submit: "Dupliquer le CV",
		titleSuffix: " (copie)",
		failed: "Impossible de dupliquer le CV",
		sourceMissing: "Ce CV n’existe plus",
	},
	deleteCv: {
		title: "Supprimer le CV",
		description: "Supprimer « {{title}} » ? Cette action est irréversible.",
		cancel: "Annuler",
		confirm: "Supprimer",
		failed: "Impossible de supprimer le CV",
	},
	cvEditor: {
		loading: "Chargement du CV…",
		saving: "Enregistrement du CV…",
		save: {
			invalid: "Impossible d'enregistrer ce CV. Corrigez les champs indiqués.",
			failed: "Impossible d'enregistrer ce CV. Réessayez.",
		},
		month: {
			invalid: "Utilisez un mois vide ou au format AAAA-MM.",
		},
		notFound: "CV introuvable",
		notFoundHint: "Ce CV est absent ou a été supprimé.",
		backToList: "Retour à la liste des CV",
		meta: "Langue du CV : {{locale}}",
		edit: {
			label: "Éditeur de CV",
		},
		identity: {
			linkPrompt: "URL du lien",
			field: {
				firstName: "Prénom",
				lastName: "Nom",
				jobTitle: "Titre du poste",
				email: "Courriel",
				phone: "Téléphone",
				postalCode: "Code postal",
				linkedin: "LinkedIn",
				github: "GitHub",
				website: "Site web",
				description: "Description",
			},
			toolbar: {
				bold: "Gras",
				italic: "Italique",
				bulletList: "Liste à puces",
				orderedList: "Liste numérotée",
				link: "Lien",
			},
		},
		goTo: {
			open: "Aller à une section",
			shortcut: "⌘K",
			title: "Aller à une section ou une entrée",
			description: "Aller à une section ou une entrée de l’éditeur",
			placeholder: "Rechercher sections et entrées…",
			empty: "Aucun résultat.",
		},
		entry: {
			expand: "Développer l’entrée",
			collapse: "Réduire l’entrée",
			expandAll: "Développer toutes les entrées",
			collapseAll: "Réduire toutes les entrées",
		},
		experiences: {
			add: "Ajouter une expérience",
			empty: "Aucune expérience pour le moment.",
			untitled: "Expérience sans titre",
			delete: "Supprimer cette expérience",
			deleteTitle: "Supprimer l’expérience",
			deleteDescription:
				"Supprimer « {{title}} » ? Cette action est irréversible.",
			deleteCancel: "Annuler",
			deleteConfirm: "Supprimer cette expérience",
			position: "Choisir une position",
			positionOption: "Position {{n}}",
			drag: "Glisser pour réordonner",
			field: {
				jobTitle: "Titre du poste",
				company: "Entreprise",
				location: "Lieu",
				startMonth: "Mois de début",
				endMonth: "Mois de fin",
				isCurrent: "Poste actuel",
				description: "Description",
			},
			errors: {
				endBeforeStart:
					"Le mois de fin doit être égal ou postérieur au mois de début.",
			},
		},
		education: {
			add: "Ajouter une formation",
			empty: "Aucune formation pour le moment.",
			untitled: "Formation sans titre",
			delete: "Supprimer cette formation",
			deleteTitle: "Supprimer la formation",
			deleteDescription:
				"Supprimer « {{title}} » ? Cette action est irréversible.",
			deleteCancel: "Annuler",
			deleteConfirm: "Supprimer cette formation",
			position: "Choisir une position",
			positionOption: "Position {{n}}",
			drag: "Glisser pour réordonner",
			field: {
				school: "Établissement",
				degree: "Diplôme",
				location: "Ville / pays",
				startMonth: "Mois de début",
				endMonth: "Mois de fin",
			},
			errors: {
				endBeforeStart:
					"Le mois de fin doit être égal ou postérieur au mois de début.",
			},
		},
		languages: {
			add: "Ajouter une langue",
			empty: "Aucune langue pour le moment.",
			untitled: "Langue sans titre",
			delete: "Supprimer cette langue",
			deleteTitle: "Supprimer la langue",
			deleteDescription:
				"Supprimer « {{title}} » ? Cette action est irréversible.",
			deleteCancel: "Annuler",
			deleteConfirm: "Supprimer cette langue",
			position: "Choisir une position",
			positionOption: "Position {{n}}",
			drag: "Glisser pour réordonner",
			field: {
				language: "Langue",
				level: "Niveau",
			},
		},
		customs: {
			add: "Ajouter une section personnalisée",
			untitled: "Section sans titre",
			delete: "Supprimer cette section",
			deleteTitle: "Supprimer la section personnalisée",
			deleteDescription:
				"Supprimer « {{title}} » ? Cette action est irréversible.",
			deleteCancel: "Annuler",
			deleteConfirm: "Supprimer cette section",
			field: {
				title: "Titre de la section",
				description: "Description",
			},
		},
		sections: {
			position: "Choisir une position",
			positionOption: "Position {{n}}",
			drag: "Glisser pour réordonner",
		},

		preview: {
			label: "Aperçu du CV canadien",
			unnamed: "Nom",
			sectionEmpty: "Aucune entrée pour le moment.",
			present: "Présent",
		},
		section: {
			identity: "Identité",
			experiences: "Expériences",
			education: "Formation",
			languages: "Langues",
		},
	},
} satisfies typeof en;
