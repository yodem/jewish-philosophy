import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getHomePage } from "@/data/loaders";
import Container from '@mui/material/Container';

export default async function HomeRoute() {
  const homeRes = await getHomePage();  
  const blocks = homeRes?.data?.blocks || [];
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <ErrorBoundary>
        <BlockRenderer blocks={blocks} />
      </ErrorBoundary>
    </Container>
  );
}
