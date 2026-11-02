import { useEffect, useMemo, useState } from "react";

import type { CvContent } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/ui/command";
import { buildGoToTargets } from "../model/go-to-targets";
import { setLocationHash } from "../model/use-location-hash";

type GoToCommandProps = {
	content: CvContent;
	disabled?: boolean;
};

export function GoToCommand({ content, disabled = false }: GoToCommandProps) {
	const { t } = useAppTranslation();
	const [open, setOpen] = useState(false);

	const targets = useMemo(
		() =>
			buildGoToTargets(content, {
				identity: t("cvEditor.section.identity"),
				experiences: t("cvEditor.section.experiences"),
				education: t("cvEditor.section.education"),
				languages: t("cvEditor.section.languages"),
				untitledCustom: t("cvEditor.customs.untitled"),
			}),
		[content, t],
	);

	const groups = useMemo(() => {
		const order: string[] = [];
		const byGroup = new Map<string, typeof targets>();
		for (const target of targets) {
			const list = byGroup.get(target.groupId);
			if (list) {
				list.push(target);
				continue;
			}
			order.push(target.groupId);
			byGroup.set(target.groupId, [target]);
		}
		return order.map((groupId) => {
			const items = byGroup.get(groupId) ?? [];
			return {
				groupId,
				groupLabel: items[0]?.groupLabel ?? groupId,
				items,
			};
		});
	}, [targets]);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (disabled) {
				return;
			}
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen(true);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [disabled]);

	return (
		<>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={disabled}
				onClick={() => setOpen(true)}
			>
				{t("cvEditor.goTo.open")}
				<span className="text-muted-foreground text-xs">
					{t("cvEditor.goTo.shortcut")}
				</span>
			</Button>
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title={t("cvEditor.goTo.title")}
				description={t("cvEditor.goTo.description")}
			>
				<Command>
					<CommandInput placeholder={t("cvEditor.goTo.placeholder")} />
					<CommandList>
						<CommandEmpty>{t("cvEditor.goTo.empty")}</CommandEmpty>
						{groups.map((group) => (
							<CommandGroup key={group.groupId} heading={group.groupLabel}>
								{group.items.map((item) => (
									<CommandItem
										key={item.id}
										value={`${item.groupLabel} ${item.label} ${item.id}`}
										onSelect={() => {
											setOpen(false);
											setLocationHash(item.id);
										}}
									>
										{item.label}
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}
