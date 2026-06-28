"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useEffect, useState, type KeyboardEvent } from "react";
import { appPalette } from "@/theme/palette";

const toolbarButtonSx = {
  flexShrink: 0,
  whiteSpace: "nowrap",
};

export default function SearchToolbar({
  urlQuery,
  onSearch,
}: {
  urlQuery: string;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function submit() {
    onSearch(query.trim());
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ mb: 3 }}
    >
      <TextField
        id="snippet-search-input"
        name="snippet-query"
        fullWidth
        placeholder="Search snippets by keyword…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        inputProps={{
          autoComplete: "off",
          "data-lpignore": "true",
          "data-form-type": "other",
        }}
        sx={{
          bgcolor: "#fff",
          borderRadius: 1,
          "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: appPalette.color3 }} />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={submit}
        sx={toolbarButtonSx}
      >
        Search
      </Button>
    </Stack>
  );
}
