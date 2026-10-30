import type {
	DragEndEvent,
	DraggableAttributes,
	DraggableSyntheticListeners,
	Modifier,
} from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

const restrictToList: Modifier = ({
	transform,
	draggingNodeRect,
	containerNodeRect,
}) => {
	const next = { ...transform, x: 0 };
	if (!draggingNodeRect || !containerNodeRect) {
		return next;
	}
	const minY = containerNodeRect.top - draggingNodeRect.top;
	const maxY =
		containerNodeRect.top +
		containerNodeRect.height -
		(draggingNodeRect.top + draggingNodeRect.height);
	return {
		...next,
		y: Math.min(Math.max(next.y, minY), maxY),
	};
};

export type ReorderDragHandle = {
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners | undefined;
};

type ReorderItem = { id: string };

type ReorderListProps<T extends ReorderItem> = {
	items: readonly T[];
	onMove: (id: string, toIndex: number) => void;
	renderItem: (item: T, index: number, drag: ReorderDragHandle) => ReactNode;
	className?: string;
};

export function ReorderList<T extends ReorderItem>({
	items,
	onMove,
	renderItem,
	className,
}: ReorderListProps<T>) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}
		const toIndex = items.findIndex((item) => item.id === over.id);
		if (toIndex < 0) {
			return;
		}
		onMove(String(active.id), toIndex);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			measuring={{ droppable: { strategy: MeasuringStrategy.BeforeDragging } }}
			modifiers={[restrictToList]}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map((item) => item.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className={cn("relative flex flex-col gap-4", className)}>
					{items.map((item, index) => (
						<ReorderRow key={item.id} id={item.id}>
							{(handle) => renderItem(item, index, handle)}
						</ReorderRow>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

function ReorderRow({
	id,
	children,
}: {
	id: string;
	children: (drag: ReorderDragHandle) => ReactNode;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	return (
		<div
			ref={setNodeRef}
			className={cn({ "relative z-10": isDragging })}
			style={{
				// Translate drops scale so a tall card keeps its size while following the pointer.
				transform: CSS.Translate.toString(transform),
				transition,
			}}
		>
			{children({ attributes, listeners })}
		</div>
	);
}
