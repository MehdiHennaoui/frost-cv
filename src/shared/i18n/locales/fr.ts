import type { en } from "./en";

export const fr = {
	dialog: {
		close: "Fermer",
	},
	notFound: {
		title: "Page introuvable",
		home: "Retour à vos CV",
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
		import: "Importer JSON",
		empty: "Aucun CV pour le moment.",
		loading: "Chargement des CV…",
		meta: "Langue du CV : {{locale}} · Mis à jour {{updatedAt}}",
		delete: "Supprimer ce CV",
		deleteNamed: "Supprimer ce CV : {{title}}",
		export: "Exporter ce CV",
		exportNamed: "Exporter ce CV en JSON : {{title}}",
		unknownDate: "Date inconnue",
	},
	cvExport: {
		export: "Exporter JSON",
		print: "Exporter en PDF",
		importTitle: "Importer un CV depuis JSON",
		importDescription:
			"Choisissez un fichier JSON Frost CV. Un nouveau CV sera créé.",
		replaceTitle: "Remplacer le CV depuis JSON",
		replaceDescription:
			"L’import remplacera « {{title}} » par le contenu du fichier. Cette action est irréversible.",
		replaceReady: "Prêt à remplacer par « {{title}} ».",
		replaceConfirm: "Remplacer le CV",
		chooseFile: "Choisir un fichier JSON",
		cancel: "Annuler",
		invalidJson: "Ce fichier n’est pas un JSON valide.",
		unsupportedVersion:
			"Cette version d’export JSON n’est pas prise en charge.",
		invalidSchema: "Ce fichier JSON ne correspond pas au schéma d’export CV.",
		importFailed: "Impossible d’importer ce CV.",
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
