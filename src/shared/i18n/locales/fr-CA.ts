import type { en } from "./en";

export const frCA = {
	dialog: {
		close: "Fermer",
	},
	uiLocale: {
		label: "Langue de l’interface",
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
} satisfies typeof en;
