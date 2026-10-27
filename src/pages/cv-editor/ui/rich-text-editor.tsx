import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	BoldIcon,
	ItalicIcon,
	LinkIcon,
	ListIcon,
	ListOrderedIcon,
} from "lucide-react";
import { useLayoutEffect } from "react";

import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { useResizableContentHeight } from "../model/use-resizable-content-height";

type RichTextEditorProps = {
	id?: string;
	value: string;
	onChange: (html: string) => void;
	onBlur?: () => void;
	"aria-invalid"?: boolean;
};

export function RichTextEditor({
	id,
	value,
	onChange,
	onBlur,
	"aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
	const { t } = useAppTranslation();
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: false,
				code: false,
				codeBlock: false,
				blockquote: false,
				horizontalRule: false,
				strike: false,
				underline: false,
			}),
			Link.configure({
				openOnClick: false,
				autolink: true,
				HTMLAttributes: {
					rel: "noopener noreferrer",
					target: "_blank",
				},
			}),
		],
		content: value || "",
		editorProps: {
			attributes: {
				id: id ?? "",
				class:
					"prose prose-sm max-w-none px-2.5 py-2 outline-none focus-visible:outline-none",
				...(ariaInvalid ? { "aria-invalid": "true" } : {}),
			},
		},
		onUpdate: ({ editor: current }) => {
			onChange(current.getHTML());
		},
		onBlur: () => {
			onBlur?.();
		},
	});

	const { ref: bodyRef, style: bodyStyle } = useResizableContentHeight(
		editor ? value : undefined,
	);

	useLayoutEffect(() => {
		if (!editor || editor.isFocused) {
			return;
		}
		if (editor.getHTML() === (value || "")) {
			return;
		}
		editor.commands.setContent(value || "", { emitUpdate: false });
	}, [editor, value]);

	if (!editor) {
		return null;
	}

	function setLink() {
		const previous = editor?.getAttributes("link").href as string | undefined;
		const next = window.prompt(
			t("cvEditor.identity.linkPrompt"),
			previous ?? "",
		);
		if (next === null) {
			return;
		}
		const trimmed = next.trim();
		if (trimmed === "") {
			editor?.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor
			?.chain()
			.focus()
			.extendMarkRange("link")
			.setLink({ href: trimmed })
			.run();
	}

	return (
		<div
			className={cn(
				"rounded-md border border-input bg-transparent shadow-xs",
				"focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
				ariaInvalid &&
					"border-destructive ring-3 ring-destructive/20 dark:ring-destructive/40",
			)}
		>
			<div className="flex flex-wrap gap-0.5 rounded-t-md border-input border-b bg-muted/30 p-1">
				<Button
					type="button"
					size="icon-sm"
					variant={editor.isActive("bold") ? "secondary" : "ghost"}
					aria-label={t("cvEditor.identity.toolbar.bold")}
					aria-pressed={editor.isActive("bold")}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<BoldIcon />
				</Button>
				<Button
					type="button"
					size="icon-sm"
					variant={editor.isActive("italic") ? "secondary" : "ghost"}
					aria-label={t("cvEditor.identity.toolbar.italic")}
					aria-pressed={editor.isActive("italic")}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<ItalicIcon />
				</Button>
				<Button
					type="button"
					size="icon-sm"
					variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
					aria-label={t("cvEditor.identity.toolbar.bulletList")}
					aria-pressed={editor.isActive("bulletList")}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<ListIcon />
				</Button>
				<Button
					type="button"
					size="icon-sm"
					variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
					aria-label={t("cvEditor.identity.toolbar.orderedList")}
					aria-pressed={editor.isActive("orderedList")}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<ListOrderedIcon />
				</Button>
				<Button
					type="button"
					size="icon-sm"
					variant={editor.isActive("link") ? "secondary" : "ghost"}
					aria-label={t("cvEditor.identity.toolbar.link")}
					aria-pressed={editor.isActive("link")}
					onClick={setLink}
				>
					<LinkIcon />
				</Button>
			</div>
			<div
				ref={bodyRef}
				className="resize-y overflow-y-auto rounded-b-md"
				style={bodyStyle}
			>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
