import { ExternalLink, MapPin } from "lucide-react";

const LOCATIONS = [
  {
    name: "Calicut Office",
    address:
      "Orbits Complex, Jafarkhan Colony Road, Calicut, Kerala, India",
    mapEmbedUrl: process.env.NEXT_PUBLIC_CALICUT_MAP_EMBED_URL!,
    mapUrl: process.env.NEXT_PUBLIC_CALICUT_MAP_URL!,
  },
  {
    name: "Sharjah Office",
    address:
      "Ayadi, Shams Free Zone, Sharjah Media City, Sharjah, UAE",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Ayadi,+Shams+Free+Zone,+Sharjah+Media+City,+Sharjah,+UAE&output=embed",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Ayadi,+Shams+Free+Zone,+Sharjah+Media+City,+Sharjah,+UAE",
  },
];

export default function ContactLocation() {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          Visit Us
        </span>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Our Locations
        </h2>

        <p className="mt-3 leading-7 text-gray-600">
          Connect with Ayadi Cloudversity or visit one of our
          locations. We are here to help you with your questions
          and enquiries.
        </p>
      </div>

      {/* Locations */}
      <div className="space-y-8">
        {LOCATIONS.map((location) => (
          <div
            key={location.name}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Location Details */}
            <div className="p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-md shadow-accent/25">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {location.name}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {location.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden border-t border-gray-100 bg-gray-100">
              <iframe
                src={location.mapEmbedUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${location.name} map`}
              />
            </div>

            {/* Google Maps Link */}
            <div className="p-5 sm:p-6">
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
              >
                Open in Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
