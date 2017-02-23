import 'fluent-intl-polyfill';
import { MessageContext } from 'fluent/compat';
import { parse, lineOffset, columnOffset } from 'fluent-syntax/compat';

export function annotation_display(source, entry, annot) {
    const { name, message, pos } = annot;

    const slice = source.substring(entry.span.from, entry.span.to).trimRight();
    const line_offset = lineOffset(source, pos);
    const column_offset = columnOffset(source, pos);
    const span_offset = lineOffset(source, entry.span.from);
    const head_len = line_offset - span_offset + 1;
    const lines = slice.split('\n');
    const head = lines.slice(0, head_len).join('\n');
    const tail = lines.slice(head_len).join('\n');

    return {
        name,
        message,
        line_offset,
        column_offset,
        head,
        tail
    }
}

export function parse_translations(translations) {
    const res = parse(translations);
    const annotations = res.body.reduce(
        (annots, entry) => annots.concat(
            entry.annotations.map(
                annot => annotation_display(translations, entry, annot)

            )
        ),
        []
    );
    return [res, annotations];
}

export function create_context(translations) {
    const context = new MessageContext('en-US');
    context.addMessages(translations);
    return context;
}

export function format_messages(context, externals) {
    const outputs = new Map(); 
    const errors = [];
    for (const [id, message] of context.messages) {
        outputs.set(id, context.format(message, externals, errors)); 
    }
    return [outputs, errors];
}

export function parse_externals(externals) {
    try {
        return [JSON.parse(externals), []];
    } catch (err) {
        return [{}, [err]];
    }
}
