import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { labelClass, type BoardSettings, type Label } from "@/lib/board";
import {
  BOARD_THEMES,
  DIALOG_THEMES,
  LABEL_STYLES,
  dialogTheme,
  type SurfaceTheme,
} from "@/lib/theme";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: BoardSettings;
  labels: Label[];
  onChange: (patch: Partial<BoardSettings>) => void;
  onReset: () => void;
};

function Swatches({
  themes,
  value,
  onSelect,
  idPrefix,
}: {
  themes: SurfaceTheme[];
  value: string;
  onSelect: (id: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {themes.map((t) => (
        <button
          key={`${idPrefix}-${t.id}`}
          onClick={() => onSelect(t.id)}
          aria-pressed={value === t.id}
          className={cn(
            "flex flex-col items-start gap-1.5 rounded-lg border p-2 text-left transition-colors",
            value === t.id ? "border-ring" : "border-border hover:border-ring/50",
          )}
        >
          <span
            className="h-8 w-full rounded-md border border-border"
            style={{ background: t.swatch }}
          />
          <span className="text-xs">{t.name}</span>
        </button>
      ))}
    </div>
  );
}

export function BoardSettingsDialog({
  open,
  onOpenChange,
  settings,
  labels,
  onChange,
  onReset,
}: Props) {
  const dialogPreview = dialogTheme(settings.dialogTheme, settings.boardTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        style={{ ...dialogPreview.vars, background: dialogPreview.background }}
      >
        <DialogHeader>
          <DialogTitle>Appearance</DialogTitle>
          <DialogDescription>
            Pick the colours for the board canvas, the card dialog and your labels.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Board background
          </h3>
          <Swatches
            idPrefix="board"
            themes={BOARD_THEMES}
            value={settings.boardTheme}
            onSelect={(boardTheme) => onChange({ boardTheme })}
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Dialog background
          </h3>
          <Swatches
            idPrefix="dialog"
            themes={DIALOG_THEMES}
            value={settings.dialogTheme}
            onSelect={(id) => onChange({ dialogTheme: id })}
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Label style
          </h3>
          <div className="flex flex-wrap gap-2">
            {LABEL_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ labelStyle: s.id })}
                aria-pressed={settings.labelStyle === s.id}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                  settings.labelStyle === s.id
                    ? "border-ring text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(labels.length ? labels : []).slice(0, 6).map((l) => (
              <span
                key={l.id}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  labelClass(l.color, settings.labelStyle),
                )}
              >
                {l.name}
              </span>
            ))}
          </div>
        </section>

        <button
          onClick={onReset}
          className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset appearance
        </button>
      </DialogContent>
    </Dialog>
  );
}
