import {Link} from "gatsby"
import * as React from "react"
import {DateUtils} from "../DateUtils"
import {Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableRow, Typography,} from "@mui/material";

interface BlogArticleTableProps {
    nodes: Blog[]
}

export interface Blog {
    blogsId: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({nodes}) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableBody>
                    {nodes.map(node => {
                        const title = node.title || node.blogsId
                        const publishedDate = DateUtils.formatDate(
                            new Date(Date.parse(node.publishedAt)),
                            "YYYY年MM月DD日 hh:mm"
                        )

                        return (
                            <>
                                <TableRow key={node.blogsId}>
                                    <TableCell align="left">
                                        <Typography
                                            variant="body1"
                                            color="textPrimary"
                                            component="p"
                                        >
                                            <Link
                                                to={`/blog/${node.blogsId}`}
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                {title}
                                            </Link>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="p"
                                        >
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </>
                        )
                    })}
                </TableBody>
                <TableFooter>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}

export default BlogTable
