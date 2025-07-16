import { SeriesContentProps } from "@/types";

export function SeriesContent(props: SeriesContentProps) {
  return (
    <div className="series-content-block p-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-2">{props.Title}</h2>
      <div className="text-sm text-gray-500 mb-2">By {props.Author} | Series: {props.seriesName}</div>
      {props.Image && (
        <img
          src={props.Image.url}
          alt={props.Image.alternativeText || props.Title}
          className="w-full max-w-md mb-4 rounded"
        />
      )}
      <div className="prose mb-4" dangerouslySetInnerHTML={{ __html: props.description }} />
      {props.youtubeLink && (
        <div className="mt-4">
          {/* Render YouTube link or embed here if structure is known */}
          <pre>{JSON.stringify(props.youtubeLink, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 