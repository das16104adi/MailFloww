-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_address" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_threads" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT,
    "thread_id" TEXT,
    "participants" TEXT[],
    "last_message_at" TIMESTAMP(3),
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" UUID NOT NULL,
    "thread_id" UUID,
    "user_id" UUID NOT NULL,
    "email_account_id" UUID,
    "message_id" TEXT,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT,
    "to_email" TEXT NOT NULL,
    "to_name" TEXT,
    "cc_emails" TEXT[],
    "bcc_emails" TEXT[],
    "subject" TEXT,
    "body_text" TEXT,
    "body_html" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "labels" TEXT[],
    "sent_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis" (
    "id" UUID NOT NULL,
    "email_id" UUID,
    "thread_id" UUID,
    "summary" TEXT,
    "key_points" TEXT[],
    "sentiment" TEXT,
    "urgency_level" TEXT,
    "topics" TEXT[],
    "action_items" TEXT[],
    "questions" TEXT[],
    "confidence_score" DECIMAL(3,2),
    "processing_time_ms" INTEGER,
    "model_used" TEXT,
    "model_version" TEXT,
    "analysis_type" TEXT,
    "context_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_replies" (
    "id" UUID NOT NULL,
    "email_id" UUID,
    "thread_id" UUID,
    "analysis_id" UUID,
    "generated_reply" TEXT NOT NULL,
    "reply_style" TEXT,
    "custom_prompt" TEXT,
    "confidence_score" DECIMAL(3,2),
    "processing_time_ms" INTEGER,
    "model_used" TEXT,
    "model_version" TEXT,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "user_edited_reply" TEXT,
    "user_feedback" INTEGER,
    "user_feedback_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_contexts" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workflow_state" JSONB,
    "conversation_memory" JSONB,
    "user_preferences" JSONB,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reply_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_id" UUID,
    "ai_reply_id" UUID,
    "user_reply" TEXT NOT NULL,
    "reply_style_used" TEXT,
    "ai_suggestion_used" BOOLEAN NOT NULL DEFAULT false,
    "user_satisfaction" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reply_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_embeddings" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "embedding_model" TEXT NOT NULL DEFAULT 'BAAI/bge-large-en-v1.5',
    "content_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "cluster_id" TEXT,
    "cluster_distance" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding_clusters" (
    "id" UUID NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "center_embedding" DOUBLE PRECISION[],
    "embedding_model" TEXT NOT NULL,
    "thread_count" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "topics" JSONB,
    "avg_sentiment" TEXT,
    "avg_urgency" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embedding_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "similar_threads" (
    "id" UUID NOT NULL,
    "source_thread_id" UUID NOT NULL,
    "similar_thread_id" UUID NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "similarity_type" TEXT NOT NULL DEFAULT 'cosine',
    "embedding_model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "similar_threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_user_id_email_address_key" ON "email_accounts"("user_id", "email_address");

-- CreateIndex
CREATE UNIQUE INDEX "emails_message_id_key" ON "emails"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "thread_embeddings_thread_id_key" ON "thread_embeddings"("thread_id");

-- CreateIndex
CREATE INDEX "thread_embeddings_cluster_id_idx" ON "thread_embeddings"("cluster_id");

-- CreateIndex
CREATE INDEX "thread_embeddings_embedding_model_idx" ON "thread_embeddings"("embedding_model");

-- CreateIndex
CREATE INDEX "thread_embeddings_content_hash_idx" ON "thread_embeddings"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "embedding_clusters_cluster_id_key" ON "embedding_clusters"("cluster_id");

-- CreateIndex
CREATE INDEX "embedding_clusters_embedding_model_idx" ON "embedding_clusters"("embedding_model");

-- CreateIndex
CREATE INDEX "embedding_clusters_thread_count_idx" ON "embedding_clusters"("thread_count");

-- CreateIndex
CREATE INDEX "similar_threads_source_thread_id_similarity_score_idx" ON "similar_threads"("source_thread_id", "similarity_score");

-- CreateIndex
CREATE INDEX "similar_threads_similar_thread_id_similarity_score_idx" ON "similar_threads"("similar_thread_id", "similarity_score");

-- CreateIndex
CREATE UNIQUE INDEX "similar_threads_source_thread_id_similar_thread_id_embeddin_key" ON "similar_threads"("source_thread_id", "similar_thread_id", "embedding_model");

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_email_account_id_fkey" FOREIGN KEY ("email_account_id") REFERENCES "email_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_replies" ADD CONSTRAINT "ai_replies_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_replies" ADD CONSTRAINT "ai_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_replies" ADD CONSTRAINT "ai_replies_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "ai_analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_contexts" ADD CONSTRAINT "conversation_contexts_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_contexts" ADD CONSTRAINT "conversation_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reply_history" ADD CONSTRAINT "user_reply_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reply_history" ADD CONSTRAINT "user_reply_history_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reply_history" ADD CONSTRAINT "user_reply_history_ai_reply_id_fkey" FOREIGN KEY ("ai_reply_id") REFERENCES "ai_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_embeddings" ADD CONSTRAINT "thread_embeddings_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "similar_threads" ADD CONSTRAINT "similar_threads_source_thread_id_fkey" FOREIGN KEY ("source_thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "similar_threads" ADD CONSTRAINT "similar_threads_similar_thread_id_fkey" FOREIGN KEY ("similar_thread_id") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
