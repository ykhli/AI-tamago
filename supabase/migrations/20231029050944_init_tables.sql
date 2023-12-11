create table tamagotchi_status (
    id serial primary key,
    status jsonb,
    userid varchar(255),
    updatedat timestamp
);

create table tamagotchi_interactions (
    id serial primary key,
    userid varchar(255),
    interaction varchar(255),
    metadata jsonb,
    updatedat timestamp
);

-- Creating vector store
-- Reference: https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase#create-a-table-and-search-function-in-your-database
-- Visit Supabase blogpost for more: https://supabase.com/blog/openai-embeddings-postgres-vector
-- Enable the pgvector extension to work with embedding vectors
create extension vector;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector(384) -- change the dimension here if needed
);

-- Create a function to search for documents
create function match_documents (
  query_embedding vector(384),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;