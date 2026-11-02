import {
	BriefcaseIcon,
	GraduationCapIcon,
	LanguagesIcon,
	LayoutListIcon,
	LocateFixedIcon,
	type LucideIcon,
	UserIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";

import type { CvContent } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/shared/ui/command";
import { splitEntryScanLabel } from "../model/entry-scan-label";
import { buildGoToTargets, type GoToTarget } from "../model/go-to-targets";
import { setLocationHash } from "../model/use-location-hash";

type GoToCommandProps = {
	content: CvContent;
	disabled?: boolean;
};

function sectionIcon(groupId: string): LucideIcon {
	if (groupId === "identity") {
		return UserIcon;
	}
	if (groupId === "experiences") {
		return BriefcaseIcon;
	}
	if (groupId === "education") {
		return GraduationCapIcon;
	}
	if (groupId === "languages") {
		return LanguagesIcon;
	}
	return LayoutListIcon;
}

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
		const byGroup = new Map<string, GoToTarget[]>();
		for (const target of targets) {
			const list = byGroup.get(target.groupId);
			if (list) {
				list.push(target);
				continue;
			}
			order.push(target.groupId);
			byGroup.set(target.groupId, [target]);
		}
		return order.map((groupId) => ({
			groupId,
			items: byGroup.get(groupId) ?? [],
		}));
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
				<LocateFixedIcon data-icon="inline-start" />
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
						{groups.map((group, groupIndex) => {
							const Icon = sectionIcon(group.groupId);
							return (
								<Fragment key={group.groupId}>
									{groupIndex > 0 && <CommandSeparator />}
									<CommandGroup>
										{group.items.map((item) => {
											const isEntry = item.kind === "entry";
											const { order, rest } = isEntry
												? splitEntryScanLabel(item.label)
												: { order: "", rest: item.label };
											return (
												<CommandItem
													key={item.id}
													value={`${item.groupLabel} ${item.label} ${item.id}`}
													title={item.label}
													className={cn({
														"font-medium": !isEntry,
														"pl-6": isEntry,
													})}
													onSelect={() => {
														setOpen(false);
														setLocationHash(item.id);
													}}
												>
													{isEntry ? (
														<span className="flex min-w-0 items-center gap-2 border-border border-l pl-3">
															{order.length > 0 && (
																<span className="shrink-0 text-muted-foreground tabular-nums">
																	{order}
																</span>
															)}
															<span className="min-w-0 truncate">{rest}</span>
														</span>
													) : (
														<>
															<Icon aria-hidden className="size-4 shrink-0" />
															<span className="min-w-0 truncate">
																{item.label}
															</span>
														</>
													)}
												</CommandItem>
											);
										})}
									</CommandGroup>
								</Fragment>
							);
						})}
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}
