export function ErrorMessage({ message }: { message: string | null }) {
    return message ? (
      <p className="msg msg-error" role="alert">
        {message}
      </p>
    ) : null
  }
  
  export function Loading({ text = 'Cargando…' }: { text?: string }) {
    return <p className="msg">{text}</p>
  }
  