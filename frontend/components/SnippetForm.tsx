"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { SnippetCreate } from "@/lib/api";
import { appPalette } from "@/theme/palette";

export interface SnippetFormValues {
  title: string;
  body: string;
  tags: string;
}

export default function SnippetForm({
  initial,
  submitLabel,
  onSubmit,
  requireUpdateConfirm = false,
}: {
  initial?: SnippetFormValues;
  submitLabel: string;
  onSubmit: (data: SnippetCreate) => Promise<void>;
  requireUpdateConfirm?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<SnippetCreate | null>(null);

  async function save(data: SnippetCreate) {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save snippet");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = { title: title.trim(), body: body.trim(), tags: tagList };

    if (requireUpdateConfirm) {
      setPendingData(data);
      setShowConfirm(true);
      return;
    }

    void save(data);
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: `1px solid ${appPalette.color2}`,
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            fullWidth
            multiline
            minRows={8}
          />
          <TextField
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            placeholder="contract, clause"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ alignSelf: "flex-start" }}
          >
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </Stack>
      </Box>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm update"
        message="Are you sure you want to save these changes to the snippet?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowConfirm(false);
          if (pendingData) void save(pendingData);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setPendingData(null);
        }}
      />
    </>
  );
}
