import type { en } from "./en";

export const fr = {
	dialog: {
		close: "Fermer",
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
			"fr-CA": "Français (Canada)",
		},
	},
	cvList: {
		heading: "Vos CV",
		create: "Créer un CV",
		empty: "Aucun CV pour le moment.",
		loading: "Chargement des CV…",
		meta: "Langue du CV : {{locale}} · Mis à jour {{updatedAt}}",
		delete: "Supprimer ce CV",
		deleteNamed: "Supprimer ce CV : {{title}}",
		unknownDate: "Date inconnue",
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
		preview: {
			label: "Aperçu du CV canadien",
			unnamed: "Nom",
			sectionEmpty: "Aucune entrée pour le moment.",
		},
		section: {
			identity: "Identité",
			experiences: "Expériences",
			education: "Formation",
			languages: "Langues",
			customs: "Sections personnalisées",
		},
	},
} satisfies typeof en;
