"use client";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ApiError, type SnippetCreate } from "@/lib/api";
import { appPalette } from "@/theme/palette";

export interface SnippetFormValues {
  title: string;
  body: string;
  tags: string;
}

const TITLE_MAX = 200;

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsEqual(a: string, b: string): boolean {
  return parseTags(a).join("\0") === parseTags(b).join("\0");
}

export default function SnippetForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  showCancel = false,
  requireUpdateConfirm = false,
}: {
  initial?: SnippetFormValues;
  submitLabel: string;
  onSubmit: (data: SnippetCreate) => Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  requireUpdateConfirm?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    body?: string;
    tags?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<SnippetCreate | null>(null);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setBody(initial.body);
    setTags(initial.tags);
    setFieldErrors({});
  }, [initial?.title, initial?.body, initial?.tags]);

  const hasChanges = useMemo(() => {
    if (!initial) return true;
    return (
      title.trim() !== initial.title.trim() ||
      body.trim() !== initial.body.trim() ||
      !tagsEqual(tags, initial.tags)
    );
  }, [initial, title, body, tags]);

  function buildPayload(): SnippetCreate {
    return {
      title: title.trim(),
      body: body.trim(),
      tags: parseTags(tags),
    };
  }

  async function save(data: SnippetCreate) {
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (requireUpdateConfirm && initial && !hasChanges) {
      return;
    }

    const data = buildPayload();

    if (requireUpdateConfirm) {
      setPendingData(data);
      setShowSaveConfirm(true);
      return;
    }

    void save(data);
  }

  function handleCancelClick() {
    if (initial && hasChanges) {
      setShowDiscardConfirm(true);
      return;
    }
    onCancel?.();
  }

  return (
    <>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: `1px solid ${appPalette.color2}`,
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            id="snippet-title"
            name="title"
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }}
            fullWidth
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
            inputProps={{ maxLength: TITLE_MAX }}
            autoComplete="off"
          />
          <TextField
            id="snippet-body"
            name="body"
            label="Body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setFieldErrors((prev) => ({ ...prev, body: undefined }));
            }}
            fullWidth
            multiline
            minRows={8}
            error={Boolean(fieldErrors.body)}
            helperText={fieldErrors.body}
            autoComplete="off"
          />
          <TextField
            id="snippet-tags"
            name="tags"
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => {
              setTags(e.target.value);
              setFieldErrors((prev) => ({ ...prev, tags: undefined }));
            }}
            fullWidth
            placeholder="contract, clause"
            error={Boolean(fieldErrors.tags)}
            helperText={fieldErrors.tags}
            autoComplete="off"
          />
          <Stack direction="row" spacing={1} useFlexGap>
            {showCancel && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                disabled={submitting}
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={
                submitting ||
                Boolean(requireUpdateConfirm && initial && !hasChanges)
              }
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <ConfirmDialog
        open={showSaveConfirm}
        title="Confirm update"
        message="Are you sure you want to save these changes to the snippet?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowSaveConfirm(false);
          if (pendingData) void save(pendingData);
        }}
        onCancel={() => {
          setShowSaveConfirm(false);
          setPendingData(null);
        }}
      />

      <ConfirmDialog
        open={showDiscardConfirm}
        title="Discard changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        confirmColor="error"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onCancel?.();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
}
